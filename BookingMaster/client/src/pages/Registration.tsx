import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import BookingSteps from "@/components/BookingSteps";
import { apiRequest } from "@/lib/queryClient";
import { TimeSlot, Teacher, bookingFormSchema, BookingFormValues } from "@shared/schema";
import { formatDateTimeRange } from "@/lib/dates";

export default function Registration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get teacher ID and time slot ID from route params
  const route = useRoute("/booking/registration/:teacherId/:timeSlotId");
  const teacherId = route?.[1]?.teacherId ? parseInt(route[1].teacherId) : 0;
  const timeSlotId = route?.[1]?.timeSlotId ? parseInt(route[1].timeSlotId) : 0;
  
  // Fetch teacher data
  const { data: teacher, isLoading: isLoadingTeacher } = useQuery<Teacher>({
    queryKey: [`/api/teachers/${teacherId}`],
    enabled: !!teacherId,
  });
  
  // Fetch time slot data
  const { data: timeSlot, isLoading: isLoadingTimeSlot } = useQuery<TimeSlot>({
    queryKey: [`/api/timeslots/${timeSlotId}`],
    enabled: !!timeSlotId,
  });
  
  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      timeSlotId,
      teacherId,
      studentName: "",
      studentGrade: "",
      parentName: "",
      phone: "",
      email: "",
      comments: "",
      agreeTerms: false
    }
  });
  
  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Занятие забронировано",
        description: "Ваше бронирование успешно создано",
      });
      navigate(`/booking/confirmation/${data.bookingId}`);
    },
    onError: (error) => {
      toast({
        title: "Ошибка бронирования",
        description: error instanceof Error ? error.message : "Не удалось забронировать занятие",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: BookingFormValues) => {
    createBooking.mutate(data);
  };
  
  // Handle back to calendar
  const handleBackToCalendar = () => {
    navigate(`/booking/calendar/${teacherId}`);
  };
  
  const isLoading = isLoadingTeacher || isLoadingTimeSlot;
  
  return (
    <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <BookingSteps currentStep={3} />
      
      {isLoading ? (
        <div className="p-8 text-center mt-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-neutral-700">Загрузка данных...</p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-neutral-900">
              Зарегистрировать ученика и забронировать урок
            </h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {teacher && timeSlot && (
              <div className="p-4 bg-primary-50 text-sm border-b border-primary-100">
                <div className="text-center">
                  <span className="font-medium">{teacher.name}</span>
                  <span className="mx-2">•</span>
                  <span>{teacher.subject}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDateTimeRange(timeSlot)}</span>
                </div>
              </div>
            )}

            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ФИО ученика</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов Иван" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+7 (___) ___-__-__" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="studentGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Класс</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите класс" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 класс</SelectItem>
                            <SelectItem value="2">2 класс</SelectItem>
                            <SelectItem value="3">3 класс</SelectItem>
                            <SelectItem value="4">4 класс</SelectItem>
                            <SelectItem value="5">5 класс</SelectItem>
                            <SelectItem value="6">6 класс</SelectItem>
                            <SelectItem value="7">7 класс</SelectItem>
                            <SelectItem value="8">8 класс</SelectItem>
                            <SelectItem value="9">9 класс</SelectItem>
                            <SelectItem value="10">10 класс</SelectItem>
                            <SelectItem value="11">11 класс</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Комментарии</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Дополнительная информация"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs text-neutral-600">
                            Я согласен с <a href="#" className="text-primary-600 hover:text-primary-500">условиями сервиса</a> и даю согласие на обработку персональных данных
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? "Отправка..." : "Забронировать"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
