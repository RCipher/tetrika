import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import BookingSteps from "@/components/BookingSteps";
import TeacherCard from "@/components/TeacherCard";
import { Teacher } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TeacherSelection() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("45");
  
  // Fetch teachers
  const { data: teachers, isLoading, error } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });
  
  // Handle filter changes
  const handleSubjectChange = (value: string) => {
    setSubjectFilter(value);
  };
  
  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
  };
  
  const handleDurationChange = (value: string) => {
    setDurationFilter(value);
  };
  
  // Filter teachers based on selected filters
  const filteredTeachers = teachers?.filter(teacher => {
    if (subjectFilter && subjectFilter !== "all" && !teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase())) {
      return false;
    }
    
    if (gradeFilter && gradeFilter !== "all") {
      // Extract grade ranges from teacher.grades (e.g., "5-9 кл.")
      const gradesText = teacher.grades.toLowerCase();
      
      if (gradeFilter === "1-4") {
        if (!gradesText.includes("1") && !gradesText.includes("2") && 
            !gradesText.includes("3") && !gradesText.includes("4")) {
          return false;
        }
      } else if (gradeFilter === "5-8") {
        if (!gradesText.includes("5") && !gradesText.includes("6") && 
            !gradesText.includes("7") && !gradesText.includes("8")) {
          return false;
        }
      } else {
        // Filter by specific grade (9, 10, 11)
        if (!gradesText.includes(gradeFilter)) {
          return false;
        }
      }
    }
    
    return true;
  });
  
  // Handle teacher selection
  const handleSelectTeacher = (teacherId: number) => {
    navigate(`/booking/calendar/${teacherId}`);
  };
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список преподавателей",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <BookingSteps currentStep={1} />
        
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Выберите репетитора</h2>
              <p className="text-neutral-700">Выберите подходящего преподавателя для занятий</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="w-full md:w-auto">
                <Label htmlFor="subject" className="mb-1">Предмет</Label>
                <Select value={subjectFilter} onValueChange={handleSubjectChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Все предметы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все предметы</SelectItem>
                    <SelectItem value="математика">Математика</SelectItem>
                    <SelectItem value="физика">Физика</SelectItem>
                    <SelectItem value="химия">Химия</SelectItem>
                    <SelectItem value="биология">Биология</SelectItem>
                    <SelectItem value="история">История</SelectItem>
                    <SelectItem value="литература">Литература</SelectItem>
                    <SelectItem value="русский">Русский язык</SelectItem>
                    <SelectItem value="английский">Английский язык</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="grade" className="mb-1">Класс</Label>
                <Select value={gradeFilter} onValueChange={handleGradeChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Все классы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все классы</SelectItem>
                    <SelectItem value="1-4">1-4 класс</SelectItem>
                    <SelectItem value="5-8">5-8 класс</SelectItem>
                    <SelectItem value="9">9 класс</SelectItem>
                    <SelectItem value="10">10 класс</SelectItem>
                    <SelectItem value="11">11 класс</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="duration" className="mb-1">Длительность урока</Label>
                <Select value={durationFilter} onValueChange={handleDurationChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="45 минут" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="45">45 минут</SelectItem>
                    <SelectItem value="60">60 минут</SelectItem>
                    <SelectItem value="90">90 минут</SelectItem>
                    <SelectItem value="120">120 минут</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Teachers List */}
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                <p className="mt-4 text-neutral-700">Загрузка преподавателей...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeachers && filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <TeacherCard 
                      key={teacher.id} 
                      teacher={teacher} 
                      onSelect={() => handleSelectTeacher(teacher.id)} 
                    />
                  ))
                ) : (
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-neutral-700">Не найдено преподавателей по заданным критериям</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
