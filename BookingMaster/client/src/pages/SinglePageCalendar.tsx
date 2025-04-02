import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Teacher, TimeSlot, BookingFormValues } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function SinglePageCalendar() {
  // Состояние для календаря - установлено на неделю апреля 2025 года
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date("2025-04-07"), { weekStartsOn: 1 }),
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Состояние для фильтрации учителей
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<
    "all" | "1-4" | "5-9" | "9-11"
  >("all");
  const [showOverbooking, setShowOverbooking] = useState<boolean>(true);

  // Состояние формы бронирования
  const [bookingForm, setBookingForm] = useState<Partial<BookingFormValues>>({
    studentName: "",
    email: "",
    phone: "",
    studentGrade: "",
    comments: "",
    agreeTerms: false,
    timeSlotId: 0,
    teacherId: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Получение списка всех учителей
  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
  }) as { data: Teacher[] };

  // Получение списка всех временных слотов
  const { data: timeSlots = [] } = useQuery({
    queryKey: ["/api/timeslots"],
  }) as { data: TimeSlot[] };

  // Фильтрация временных слотов
  const filteredSlots = timeSlots.filter((slot) => {
    // Проверяем, что slot.date содержит корректный формат даты
    if (!slot.date || !slot.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Invalid date format:", slot.date);
      return false;
    }

    try {
      // Фильтрация по дате (для недельного представления)
      const slotDate = parseISO(slot.date);
      const endOfWeek = addDays(weekStart, 6);

      if (
        isNaN(slotDate.getTime()) ||
        slotDate < weekStart ||
        slotDate > endOfWeek
      ) {
        return false;
      }

      // Проверяем соответствие учителя выбранным фильтрам
      const teacher = teachers.find((t) => t.id === slot.teacherId);
      if (!teacher) return false;

      // Фильтр по овербукингу
      if (showOverbooking !== slot.isOverbooking) {
        return false;
      }

      // Фильтр по поисковому запросу
      if (
        searchQuery &&
        !teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Фильтр по предмету
      if (
        selectedSubject &&
        selectedSubject !== "all" &&
        teacher.subject !== selectedSubject
      ) {
        return false;
      }

      // Фильтр по группам классов
      if (selectedGradeGroup !== "all") {
        const teacherGrades = teacher.grades.split(",").map((g) => g.trim());

        let gradeGroupRange: string[] = [];
        if (selectedGradeGroup === "1-4") {
          gradeGroupRange = ["1", "2", "3", "4"];
        } else if (selectedGradeGroup === "5-9") {
          gradeGroupRange = ["5", "6", "7", "8", "9"];
        } else if (selectedGradeGroup === "9-11") {
          gradeGroupRange = ["9", "10", "11"];
        }

        if (!teacherGrades.some((grade) => gradeGroupRange.includes(grade))) {
          return false;
        }
      }

      // Удалили фильтр по доступности

      return true;
    } catch (error) {
      console.error("Error processing time slot:", slot, error);
      return false;
    }
  });

  // Группировка слотов по дням недели и часам
  const slotsByDayAndHour: Record<string, Record<number, TimeSlot[]>> = {};

  // Инициализация объекта для всех дней недели и часов
  for (let i = 0; i < 7; i++) {
    const day = format(addDays(weekStart, i), "yyyy-MM-dd");
    slotsByDayAndHour[day] = {};
    for (let hour = 9; hour <= 19; hour++) {
      slotsByDayAndHour[day][hour] = [];
    }
  }

  // Заполнение объекта слотами
  filteredSlots.forEach((slot) => {
    try {
      // Проверяем и обрабатываем разные форматы времени
      // Обработка формата ISO или строки времени (например, "10:00")
      let hourStart: number;

      if (typeof slot.startTime === "string") {
        // Проверка, является ли startTime полным ISO-форматом даты
        if (slot.startTime.includes("T")) {
          hourStart = new Date(slot.startTime).getHours();
        } else {
          // Обработка формата "HH:MM"
          hourStart = parseInt(slot.startTime.split(":")[0], 10);
        }
      } else {
        // Для других форматов (если startTime каким-то образом не строка)
        console.warn("Unexpected startTime format:", slot.startTime);
        return;
      }

      if (isNaN(hourStart)) {
        console.error("Could not parse hour from:", slot.startTime);
        return;
      }

      if (!slotsByDayAndHour[slot.date]) {
        slotsByDayAndHour[slot.date] = {};
      }

      if (!slotsByDayAndHour[slot.date][hourStart]) {
        slotsByDayAndHour[slot.date][hourStart] = [];
      }

      slotsByDayAndHour[slot.date][hourStart].push(slot);
    } catch (error) {
      console.error("Error processing time slot:", slot, error);
    }
  });

  // Обработчик выбора временного слота
  const handleTimeSlotClick = (day: string, hour: number) => {
    const slots = slotsByDayAndHour[day]?.[hour] || [];
    const availableSlots = slots.filter((slot) => !slot.isBooked);

    if (availableSlots.length === 0) return;

    console.log("Available slots:", availableSlots);

    // Находим учителей для выбранного слота
    const availableTeachers = availableSlots
      .map((slot) => {
        return teachers.find((teacher) => teacher.id === slot.teacherId);
      })
      .filter(Boolean) as Teacher[];

    setSelectedTeachers(availableTeachers);
    setSelectedSlot(availableSlots[0]);
    setBookingForm((prev) => ({
      ...prev,
      timeSlotId: availableSlots[0].id,
    }));
    setBookingModalOpen(true);
  };

  // Обработчик выбора учителя в модальном окне
  const handleTeacherSelect = (teacherId: number) => {
    if (!selectedSlot) return;

    console.log("Selected teacher:", teacherId);

    // Извлекаем час из startTime в строковом формате (например, "13:00" -> 13)
    const getHourFromTimeString = (timeStr: string): number => {
      if (timeStr && timeStr.includes(":")) {
        return parseInt(timeStr.split(":")[0], 10);
      }
      // Запасной вариант, если формат не соответствует ожидаемому
      return new Date(timeStr).getHours();
    };

    const selectedHour = getHourFromTimeString(selectedSlot.startTime);

    // Находим слот для выбранного учителя
    const teacherSlot = filteredSlots.find((slot) => {
      const slotHour = getHourFromTimeString(slot.startTime);
      return (
        slot.teacherId === teacherId &&
        slotHour === selectedHour &&
        slot.date === selectedSlot.date
      );
    });

    console.log("Found teacher slot:", teacherSlot);

    if (teacherSlot) {
      setSelectedSlot(teacherSlot);
      setBookingForm((prev) => ({
        ...prev,
        teacherId,
        timeSlotId: teacherSlot.id,
      }));
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (field: string, value: string | boolean) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  // Отправка формы бронирования
  const handleBookingSubmit = async () => {
    if (
      !selectedSlot ||
      !bookingForm.studentName ||
      !bookingForm.email ||
      !bookingForm.phone ||
      !bookingForm.studentGrade ||
      !bookingForm.agreeTerms ||
      !bookingForm.teacherId ||
      !bookingForm.timeSlotId
    ) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправляем запрос на создание бронирования
      await apiRequest("POST", "/api/bookings", bookingForm);

      toast({
        title: "Успешно",
        description: "Занятие успешно забронировано",
      });

      // Сбрасываем состояние
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setSelectedTeachers([]);
      setBookingForm({
        studentName: "",
        email: "",
        phone: "",
        studentGrade: "",
        comments: "",
        agreeTerms: false,
        timeSlotId: 0,
        teacherId: 0,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчики переключения недель
  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date("2025-04-07"), { weekStartsOn: 1 }));
  };

  // Фильтрация списка учителей
  const getFilteredTeachers = () => {
    return teachers.filter((teacher) => {
      // Фильтр по поисковому запросу
      if (
        searchQuery &&
        !teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Фильтр по предмету
      if (
        selectedSubject &&
        selectedSubject !== "all" &&
        teacher.subject !== selectedSubject
      ) {
        return false;
      }

      // Фильтр по группам классов
      if (selectedGradeGroup !== "all") {
        const teacherGrades = teacher.grades.split(",").map((g) => g.trim());

        let gradeGroupRange: string[] = [];
        if (selectedGradeGroup === "1-4") {
          gradeGroupRange = ["1", "2", "3", "4"];
        } else if (selectedGradeGroup === "5-9") {
          gradeGroupRange = ["5", "6", "7", "8", "9"];
        } else if (selectedGradeGroup === "9-11") {
          gradeGroupRange = ["9", "10", "11"];
        }

        if (!teacherGrades.some((grade) => gradeGroupRange.includes(grade))) {
          return false;
        }
      }

      // Удалили фильтр по доступности

      return true;
    });
  };

  // Получение уникальных предметов из списка учителей
  const getUniqueSubjects = () => {
    const subjects = new Set<string>();
    teachers.forEach((teacher) => subjects.add(teacher.subject));
    return Array.from(subjects);
  };

  // Получение уникальных классов из списка учителей
  const getUniqueGrades = () => {
    const grades = new Set<string>();
    teachers.forEach((teacher) => {
      const teacherGrades = teacher.grades.split(",").map((g) => g.trim());
      teacherGrades.forEach((grade) => grades.add(grade));
    });
    return Array.from(grades).sort((a, b) => parseInt(a) - parseInt(b));
  };

  // Обработчик переключения фильтра по классам
  const toggleGradeFilter = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  // Обработчик изменения фильтра группы классов
  const handleGradeGroupChange = (group: "all" | "1-4" | "5-9" | "9-11") => {
    setSelectedGradeGroup(group);
  };

  // Обработчик изменения фильтра предмета
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Фильтрованный список учителей
  const filteredTeachers = getFilteredTeachers();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Расписание занятий</h1>
        <p className="text-gray-600">Выберите удобное время для занятия</p>
      </div>

      {/* Основной контент - двухколоночный макет */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая колонка - календарь (2/3 ширины) */}
        <div className="lg:w-2/3">
          {/* Панель навигации и фильтры */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={goToPreviousWeek}>
                  Предыдущая неделя
                </Button>
                <Button variant="outline" onClick={goToCurrentWeek}>
                  Текущая неделя
                </Button>
                <Button variant="outline" onClick={goToNextWeek}>
                  Следующая неделя
                </Button>
              </div>
              <div className="text-lg font-medium">
                {format(weekStart, "d MMMM", { locale: ru })} -{" "}
                {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: ru })}
              </div>
            </div>

            {/* Фильтры */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              <div className="flex items-center space-x-4">
                {/* Поиск */}
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    className="pl-8"
                    placeholder="Поиск преподавателя"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Фильтр по предмету */}
                <div className="w-64">
                  <Select
                    value={selectedSubject}
                    onValueChange={handleSubjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все предметы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все предметы</SelectItem>
                      {getUniqueSubjects().map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Группы классов */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedGradeGroup === "all" ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedGradeGroup("all")}
                  >
                    Все классы
                  </Badge>
                  <Badge
                    variant={
                      selectedGradeGroup === "1-4" ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleGradeGroupChange("1-4")}
                  >
                    1-4 классы
                  </Badge>
                  <Badge
                    variant={
                      selectedGradeGroup === "5-9" ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleGradeGroupChange("5-9")}
                  >
                    5-9 классы
                  </Badge>
                  <Badge
                    variant={
                      selectedGradeGroup === "9-11" ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleGradeGroupChange("9-11")}
                  >
                    9-11 классы
                  </Badge>
                </div>

                {/* Чекбокс овербукинга */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overbooking"
                    checked={showOverbooking}
                    onCheckedChange={(checked) =>
                      setShowOverbooking(checked === true)
                    }
                  />
                  <Label htmlFor="overbooking">
                    Показывать овербукинг (45 мин)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Сетка календаря */}
          <div className="border rounded-lg overflow-hidden bg-white">
            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 border-b">
              {Array.from({ length: 7 }).map((_, index) => {
                const day = addDays(weekStart, index);
                return (
                  <div
                    key={index}
                    className="p-2 text-center border-r last:border-r-0"
                  >
                    <div className="font-medium">
                      {format(day, "EEEE", { locale: ru })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(day, "d MMM", { locale: ru })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Временные слоты */}
            <div className="grid">
              {Array.from({ length: 11 }).map((_, hourIndex) => {
                const hour = hourIndex + 9; // Начинаем с 9:00

                return (
                  <div
                    key={hour}
                    className="grid grid-cols-7 border-b last:border-b-0"
                  >
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = addDays(weekStart, dayIndex);
                      const dayStr = format(day, "yyyy-MM-dd");
                      const slots = slotsByDayAndHour[dayStr]?.[hour] || [];
                      const availableSlots = slots.filter(
                        (slot) => !slot.isBooked,
                      );
                      const opacity = Math.min(
                        0.2 + availableSlots.length * 0.13,
                        0.8,
                      ); // Увеличиваем прозрачность с количеством доступных слотов

                      const hasSlots = slots.length > 0;
                      const allBooked = hasSlots && availableSlots.length === 0;

                      return (
                        <div
                          key={`${dayStr}-${hour}`}
                          className="p-0 border border-gray-200 h-16 relative flex items-center justify-center"
                        >
                          {availableSlots.length > 0 ? (
                            <div
                              className={`w-full transition-all cursor-pointer absolute ${
                                availableSlots.some(
                                  (slot) => slot.isOverbooking,
                                )
                                  ? "h-3/4 top-0 rounded-md border-2 border-green-300 shadow-sm flex flex-col items-center justify-start px-2 py-1.5"
                                  : "inset-0 border border-blue-200 flex items-center justify-center p-2"
                              }`}
                              style={{
                                backgroundColor: availableSlots.some(
                                  (slot) => slot.isOverbooking,
                                )
                                  ? `rgba(34, 197, 94, ${opacity * (selectedSlot && selectedSlot.date === dayStr && selectedSlot.startTime === `${hour}:00` ? 3 : 1)})`
                                  : `rgba(59, 130, 246, ${opacity * (selectedSlot && selectedSlot.date === dayStr && selectedSlot.startTime === `${hour}:00` ? 3 : 1)})`,
                              }}
                              onClick={() => handleTimeSlotClick(dayStr, hour)}
                            >
                              <div className="text-center w-full flex flex-col gap-0.5 px-1">
                                <div className="font-medium truncate text-center">{`${hour}:00`}</div>
                                <div className="text-xs truncate text-center">
                                  <span
                                    className={`${availableSlots.some((slot) => slot.isOverbooking) ? "text-green-900" : "text-blue-800"} font-medium mx-auto block`}
                                  >
                                    {availableSlots.length}{" "}
                                    {availableSlots.length === 1
                                      ? "учитель"
                                      : availableSlots.length <= 4
                                        ? "учителя"
                                        : "учителей"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : allBooked ? (
                            <div className="w-full h-full p-2 bg-gray-100 flex items-center justify-center">
                              <div className="text-center">
                                {`${hour}:00`}
                                <div className="text-xs mt-1">
                                  <span className="text-red-500">
                                    Забронировано
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full p-2 bg-gray-50 flex items-center justify-center">
                              <div className="text-center">{`${hour}:00`}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Правая колонка - список учителей (1/3 ширины) */}
        <div className="lg:w-1/3">
          {/* Список учителей */}
          <Card>
            <CardHeader>
              <CardTitle>
                Преподаватели{" "}
                <span className="ml-1 text-sm font-normal">
                  ({filteredTeachers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[887px] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-start space-x-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{teacher.name}</h3>
                        <div className="text-sm text-gray-500">
                          {teacher.subject}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {teacher.grades.split(",").map((grade) => (
                            <Badge
                              key={grade.trim()}
                              variant="outline"
                              className="text-xs"
                            >
                              {grade.trim()} класс
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {teacher.isAvailable ? "Доступен" : "Занят"}
                        </div>
                        {teacher.rating && (
                          <div className="text-xs text-gray-500 mt-1">
                            Рейтинг: {teacher.rating} ({teacher.reviewCount})
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Не найдено учителей по заданным фильтрам</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно бронирования */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Регистрация ученика</DialogTitle>
            {selectedSlot && (
              <DialogDescription>
                <div className="text-sm mt-2">
                  <p>
                    <strong>Дата:</strong>{" "}
                    {format(parseISO(selectedSlot.date), "d MMMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                  <p>
                    <strong>Время:</strong>{" "}
                    {typeof selectedSlot.startTime === "string" &&
                    selectedSlot.startTime.includes(":")
                      ? selectedSlot.startTime
                      : format(new Date(selectedSlot.startTime), "HH:mm")}{" "}
                    -{" "}
                    {typeof selectedSlot.endTime === "string" &&
                    selectedSlot.endTime.includes(":")
                      ? selectedSlot.endTime
                      : format(new Date(selectedSlot.endTime), "HH:mm")}
                  </p>
                  <p
                    className={
                      selectedSlot.isOverbooking
                        ? "text-green-700 font-medium mt-2"
                        : "text-blue-700 font-medium mt-2"
                    }
                  >
                    {selectedSlot.isOverbooking
                      ? "Занятие «Овербукинг» (45 минут)"
                      : "Стандартное занятие (60 минут)"}
                  </p>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Выбор учителя */}
            {selectedTeachers.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="teacher">Выберите учителя</Label>
                <Select
                  value={bookingForm.teacherId?.toString() || ""}
                  onValueChange={(value) =>
                    handleTeacherSelect(parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите учителя" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name} - {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="studentName">ФИО ученика</Label>
              <Input
                id="studentName"
                value={bookingForm.studentName || ""}
                onChange={(e) =>
                  handleInputChange("studentName", e.target.value)
                }
                placeholder="Иванов Иван"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@mail.ru"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={bookingForm.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="grade">Класс</Label>
              <Select
                value={bookingForm.studentGrade || ""}
                onValueChange={(value) =>
                  handleInputChange("studentGrade", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} класс
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comments">Комментарии</Label>
              <Input
                id="comments"
                value={bookingForm.comments || ""}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                placeholder="Дополнительная информация"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={bookingForm.agreeTerms || false}
                onCheckedChange={(checked) =>
                  handleInputChange("agreeTerms", checked === true)
                }
              />
              <Label htmlFor="terms" className="text-sm">
                Я согласен с условиями сервиса и даю согласие на обработку
                персональных данных
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBookingSubmit}
              disabled={isSubmitting || !bookingForm.teacherId}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? "Обработка..." : "Забронировать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
