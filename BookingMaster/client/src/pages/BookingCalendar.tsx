import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Teacher, TimeSlot, BookingFormValues } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function BookingCalendar() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<Teacher | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormValues>({
    studentName: "",
    email: "",
    phone: "",
    studentGrade: "",
    comments: "",
    agreeTerms: false,
    timeSlotId: 0,
    teacherId: 0,
    parentName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Получение списка всех учителей
  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
  });

  // Получение списка всех временных слотов
  const { data: timeSlots = [] } = useQuery({
    queryKey: ["/api/timeslots"],
  }) as { data: TimeSlot[] };
  
  // Фильтрация слотов по дате (для недельного представления)
  const filteredSlots = timeSlots.filter((slot: TimeSlot) => {
    const slotDate = parseISO(slot.date);
    const endOfWeek = addDays(weekStart, 6);
    return slotDate >= weekStart && slotDate <= endOfWeek;
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
  filteredSlots.forEach((slot: TimeSlot) => {
    const hourStart = new Date(slot.startTime).getHours();
    if (!slotsByDayAndHour[slot.date]) {
      slotsByDayAndHour[slot.date] = {};
    }
    if (!slotsByDayAndHour[slot.date][hourStart]) {
      slotsByDayAndHour[slot.date][hourStart] = [];
    }
    slotsByDayAndHour[slot.date][hourStart].push(slot);
  });

  // Обработчик выбора слота
  const handleSlotClick = async (slot: TimeSlot) => {
    if (slot.isBooked) return;
    
    setSelectedSlot(slot);
    
    // Получаем информацию о преподавателе
    try {
      const teacher = await apiRequest(`/api/teachers/${slot.teacherId}`);
      setTeacherDetails(teacher as Teacher);
      setBookingForm((prev) => ({ ...prev, timeSlotId: slot.id, teacherId: slot.teacherId }));
      setBookingModalOpen(true);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о преподавателе",
        variant: "destructive",
      });
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (field: string, value: string | boolean) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  // Отправка формы бронирования
  const handleBookingSubmit = async () => {
    if (!selectedSlot || !bookingForm.studentName || !bookingForm.email || !bookingForm.phone || !bookingForm.studentGrade || !bookingForm.agreeTerms) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiRequest<any>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingForm),
      });
      
      toast({
        title: "Успешно",
        description: "Занятие успешно забронировано",
      });
      
      setBookingModalOpen(false);
      setSelectedSlot(null);
      setBookingForm({
        studentName: "",
        email: "",
        phone: "",
        studentGrade: "",
        comments: "",
        agreeTerms: false,
        timeSlotId: 0,
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
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Расписание занятий</h1>
        <p className="text-gray-600">Выберите удобное время для занятия</p>
      </div>
      
      {/* Панель навигации по датам */}
      <div className="flex justify-between items-center mb-6">
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
          {format(weekStart, "d MMMM", { locale: ru })} - {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: ru })}
        </div>
      </div>
      
      {/* Сетка календаря */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7 border-b">
          {Array.from({ length: 7 }).map((_, index) => {
            const day = addDays(weekStart, index);
            return (
              <div key={index} className="p-2 text-center border-r last:border-r-0">
                <div className="font-medium">{format(day, "EEEE", { locale: ru })}</div>
                <div className="text-sm text-gray-500">{format(day, "d MMM", { locale: ru })}</div>
              </div>
            );
          })}
        </div>
        
        {/* Временные слоты */}
        <div className="grid">
          {Array.from({ length: 11 }).map((_, hourIndex) => {
            const hour = hourIndex + 9; // Начинаем с 9:00
            
            return (
              <div key={hour} className="grid grid-cols-7 border-b last:border-b-0">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = addDays(weekStart, dayIndex);
                  const dayStr = format(day, "yyyy-MM-dd");
                  const slots = slotsByDayAndHour[dayStr]?.[hour] || [];
                  const availableSlots = slots.filter(slot => !slot.isBooked);
                  const opacity = Math.min(0.2 + (availableSlots.length * 0.13), 0.8); // Увеличиваем прозрачность с количеством доступных слотов
                  
                  const hasSlots = slots.length > 0;
                  const allBooked = hasSlots && availableSlots.length === 0;
                  
                  return (
                    <div
                      key={`${dayStr}-${hour}`}
                      className={`p-2 border-r last:border-r-0 h-16 relative ${
                        hasSlots
                          ? allBooked
                            ? "bg-gray-100 cursor-not-allowed"
                            : "cursor-pointer hover:bg-blue-50"
                          : "bg-gray-50"
                      }`}
                      onClick={() => {
                        if (availableSlots.length > 0) {
                          // Если есть доступные слоты, открываем модальное окно со списком учителей
                          handleSlotClick(availableSlots[0]);
                        }
                      }}
                      style={{
                        backgroundColor: availableSlots.length > 0 ? `rgba(59, 130, 246, ${opacity})` : undefined,
                      }}
                    >
                      <div className="text-center">
                        {`${hour}:00`}
                        {hasSlots && (
                          <div className="text-xs mt-1">
                            {allBooked ? (
                              <span className="text-red-500">Забронировано</span>
                            ) : (
                              <span className="text-blue-800 font-medium">
                                {availableSlots.length} {availableSlots.length === 1 ? "учитель" : availableSlots.length <= 4 ? "учителя" : "учителей"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Модальное окно бронирования */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Регистрация ученика</DialogTitle>
            <DialogDescription>
              {teacherDetails && selectedSlot && (
                <div className="text-sm mt-2">
                  <p><strong>Преподаватель:</strong> {teacherDetails.name}</p>
                  <p><strong>Предмет:</strong> {teacherDetails.subject}</p>
                  <p><strong>Дата:</strong> {format(parseISO(selectedSlot.date), "d MMMM yyyy", { locale: ru })}</p>
                  <p><strong>Время:</strong> {format(new Date(selectedSlot.startTime), "HH:mm")} - {format(new Date(selectedSlot.endTime), "HH:mm")}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studentName">ФИО ученика</Label>
              <Input
                id="studentName"
                value={bookingForm.studentName}
                onChange={e => handleInputChange("studentName", e.target.value)}
                placeholder="Иванов Иван"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.email}
                onChange={e => handleInputChange("email", e.target.value)}
                placeholder="example@mail.ru"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={bookingForm.phone}
                onChange={e => handleInputChange("phone", e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="grade">Класс</Label>
              <Select
                value={bookingForm.studentGrade}
                onValueChange={(value) => handleInputChange("studentGrade", value)}
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
                value={bookingForm.comments}
                onChange={e => handleInputChange("comments", e.target.value)}
                placeholder="Дополнительная информация"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={bookingForm.agreeTerms}
                onCheckedChange={(checked) => handleInputChange("agreeTerms", checked === true)}
              />
              <Label htmlFor="terms" className="text-sm">
                Я согласен с условиями сервиса и даю согласие на обработку персональных данных
              </Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBookingModalOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? "Обработка..." : "Забронировать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}