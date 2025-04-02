import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Booking, Teacher, TimeSlot } from "@shared/schema";

export default function AdminView() {
  const { toast } = useToast();
  
  // Fetch all bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    onError: () => {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список бронирований",
        variant: "destructive",
      });
    }
  });
  
  // Fetch all teachers
  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });
  
  // Fetch all time slots
  const { data: timeSlots } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
  });
  
  // Get teacher name by ID
  const getTeacherName = (teacherId: number) => {
    const teacher = teachers?.find(t => t.id === teacherId);
    return teacher ? teacher.name : "Неизвестный преподаватель";
  };
  
  // Get slot time by ID
  const getSlotTime = (slotId: number) => {
    const slot = timeSlots?.find(s => s.id === slotId);
    if (!slot) return "Неизвестное время";
    
    // Map day names
    const dayMap: Record<string, string> = {
      'mon': 'Понедельник',
      'tue': 'Вторник',
      'wed': 'Среда',
      'thu': 'Четверг',
      'fri': 'Пятница',
      'sat': 'Суббота',
      'sun': 'Воскресенье'
    };
    
    const day = dayMap[slot.dayOfWeek] || slot.dayOfWeek;
    return `${day}, ${slot.date}, ${slot.startTime}-${slot.endTime}`;
  };
  
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Панель администратора</CardTitle>
          <CardDescription>
            Просмотр всех бронирований в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
              <p className="mt-4 text-neutral-700">Загрузка бронирований...</p>
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-neutral-700">Нет бронирований в системе</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID бронирования</TableHead>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Класс</TableHead>
                    <TableHead>Преподаватель</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Дата и время</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.studentName}</TableCell>
                      <TableCell>{booking.studentGrade}</TableCell>
                      <TableCell>{getTeacherName(booking.teacherId)}</TableCell>
                      <TableCell>{booking.phone}</TableCell>
                      <TableCell>{booking.email}</TableCell>
                      <TableCell>{getSlotTime(booking.timeSlotId)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
