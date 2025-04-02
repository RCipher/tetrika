import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingSteps from "@/components/BookingSteps";
import { Booking, Teacher, TimeSlot } from "@shared/schema";
import { formatDateTimeRange } from "@/lib/dates";

export default function Confirmation() {
  const [, navigate] = useLocation();
  
  // Get booking ID from route params
  const route = useRoute("/booking/confirmation/:bookingId");
  const bookingId = route?.[1]?.bookingId || "";
  
  // Fetch all bookings (we'll filter to find the one with matching bookingId)
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Find the current booking
  const booking = bookings?.find(b => b.bookingId === bookingId);
  
  // Fetch teacher data if booking exists
  const { data: teacher, isLoading: isLoadingTeacher } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${booking?.teacherId}`],
    enabled: !!booking?.teacherId,
  });
  
  // Fetch time slot data if booking exists
  const { data: timeSlot, isLoading: isLoadingTimeSlot } = useQuery<TimeSlot>({
    queryKey: [`/api/timeslots/${booking?.timeSlotId}`],
    enabled: !!booking?.timeSlotId,
  });
  
  const isLoading = isLoadingBookings || isLoadingTeacher || isLoadingTimeSlot;
  
  const handleReturnToHome = () => {
    navigate("/");
  };
  
  const handleBookAgain = () => {
    navigate("/booking");
  };
  
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <BookingSteps currentStep={4} />
        
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                <p className="mt-4 text-neutral-700">Загрузка данных о бронировании...</p>
              </div>
            ) : !booking || !teacher || !timeSlot ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Бронирование не найдено
                </h2>
                <p className="text-neutral-700 mb-8">
                  Информация о бронировании недоступна или была удалена
                </p>
                <Button onClick={handleReturnToHome}>
                  Вернуться на главную
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Занятие успешно забронировано!
                </h2>
                <p className="text-neutral-700 mb-8">
                  Информация о бронировании отправлена на указанный email
                </p>
                
                <div className="bg-white rounded-lg border border-neutral-200 p-6 max-w-lg mx-auto text-left">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">
                    Детали бронирования
                  </h3>
                  
                  <div className="divide-y divide-neutral-200">
                    <div className="py-3 flex justify-between">
                      <span className="text-neutral-600">Репетитор:</span>
                      <span className="font-medium">{teacher.name}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-neutral-600">Предмет:</span>
                      <span className="font-medium">{teacher.subject}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-neutral-600">Дата и время:</span>
                      <span className="font-medium">
                        {formatDateTimeRange(timeSlot)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-neutral-600">Ученик:</span>
                      <span className="font-medium">{booking.studentName}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-neutral-600">Номер бронирования:</span>
                      <span className="font-medium">{booking.bookingId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReturnToHome}
                  >
                    На главную
                  </Button>
                  <Button 
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    onClick={handleBookAgain}
                  >
                    Забронировать еще
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
