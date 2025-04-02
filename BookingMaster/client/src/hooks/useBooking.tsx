import { useState, createContext, useContext, ReactNode } from "react";
import { Teacher, TimeSlot } from "@shared/schema";

interface BookingContextValue {
  selectedTeacher: Teacher | null;
  setSelectedTeacher: (teacher: Teacher | null) => void;
  selectedTimeSlot: TimeSlot | null;
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void;
  clearSelection: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  const clearSelection = () => {
    setSelectedTeacher(null);
    setSelectedTimeSlot(null);
  };
  
  return (
    <BookingContext.Provider value={{
      selectedTeacher,
      setSelectedTeacher,
      selectedTimeSlot,
      setSelectedTimeSlot,
      clearSelection
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
