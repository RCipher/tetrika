import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingSteps from "@/components/BookingSteps";
import CalendarGrid from "@/components/CalendarGrid";
import SelectedSlotPreview from "@/components/SelectedSlotPreview";
import { TimeSlot, Teacher } from "@shared/schema";
import { formatWeekRangeText } from "@/lib/dates";

export default function Calendar() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2023, 10, 27)); // Nov 27, 2023
  
  // Get teacher ID from route params
  const route = useRoute("/booking/calendar/:teacherId");
  const teacherId = route?.[1]?.teacherId ? parseInt(route[1].teacherId) : 0;
  
  // Fetch teacher data
  const { data: teacher, isLoading: isLoadingTeacher } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${teacherId}`],
    enabled: !!teacherId,
  });
  
  // Fetch time slots for this teacher
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery<TimeSlot[]>({
    queryKey: [`/api/teachers/${teacherId}/timeslots`],
    enabled: !!teacherId,
  });
  
  // Handle navigation between weeks
  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };
  
  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };
  
  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };
  
  // Handle continue to registration
  const handleContinueToRegistration = () => {
    if (selectedSlot) {
      navigate(`/booking/registration/${teacherId}/${selectedSlot.id}`);
    } else {
      toast({
        title: "Выберите время",
        description: "Пожалуйста, выберите время для занятия",
        variant: "destructive",
      });
    }
  };
  
  // Handle back to teachers
  const handleBackToTeachers = () => {
    navigate("/booking");
  };
  
  // Format the week range text (e.g., "27 ноября — 03 декабря")
  const weekRangeText = formatWeekRangeText(currentWeekStart);
  
  const isLoading = isLoadingTeacher || isLoadingTimeSlots;
  
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <BookingSteps currentStep={2} />
        
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Выберите время занятия
                </h2>
                {teacher && (
                  <p className="text-neutral-700">
                    <span className="font-medium">{teacher.name}</span> • 
                    <span className="text-neutral-600"> {teacher.subject}</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center"
                onClick={handleBackToTeachers}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Назад к выбору репетитора
              </Button>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                <p className="mt-4 text-neutral-700">Загрузка расписания...</p>
              </div>
            ) : (
              <>
                {/* Date Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousWeek}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Пред. неделя
                  </Button>
                  
                  <h3 className="text-lg font-medium text-neutral-900">
                    {weekRangeText}
                  </h3>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextWeek}
                    className="flex items-center"
                  >
                    След. неделя
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <CalendarGrid
                  timeSlots={timeSlots || []}
                  weekStart={currentWeekStart}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                />
                
                <div className="mt-6 text-sm text-neutral-600">
                  <p>* Время указано в соответствии со временем на вашем компьютере</p>
                </div>

                {/* Selected Slot Preview */}
                {selectedSlot && teacher && (
                  <SelectedSlotPreview
                    slot={selectedSlot}
                    teacher={teacher}
                    onContinue={handleContinueToRegistration}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
