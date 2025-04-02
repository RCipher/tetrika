import { useMemo } from "react";
import { TimeSlot as TimeSlotType } from "@shared/schema";
import TimeSlot from "@/components/TimeSlot";
import { getDayName, formatDate } from "@/lib/dates";

interface CalendarGridProps {
  timeSlots: TimeSlotType[];
  weekStart: Date;
  selectedSlot: TimeSlotType | null;
  onSelectSlot: (slot: TimeSlotType) => void;
}

export default function CalendarGrid({ 
  timeSlots, 
  weekStart, 
  selectedSlot, 
  onSelectSlot 
}: CalendarGridProps) {
  const days = useMemo(() => {
    const result = [];
    const currentDay = new Date(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDay);
      result.push(date);
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return result;
  }, [weekStart]);
  
  // Get all unique hours from time slots
  const hours = useMemo(() => {
    const uniqueHours = new Set<number>();
    
    timeSlots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      uniqueHours.add(hour);
    });
    
    return Array.from(uniqueHours).sort((a, b) => a - b);
  }, [timeSlots]);
  
  // Map day names to shortcodes
  const dayToShortcode: Record<string, string> = {
    "monday": "mon",
    "tuesday": "tue",
    "wednesday": "wed",
    "thursday": "thu",
    "friday": "fri",
    "saturday": "sat",
    "sunday": "sun"
  };
  
  // Get slots for a specific day and hour
  const getSlotForDayAndHour = (dayDate: Date, hour: number) => {
    const dayName = getDayName(dayDate).toLowerCase();
    const dayShortcode = dayToShortcode[dayName];
    
    return timeSlots.find(slot => 
      slot.dayOfWeek === dayShortcode && 
      parseInt(slot.startTime.split(':')[0]) === hour
    );
  };
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {days.map((day, index) => (
          <div key={index} className="py-2 text-center text-sm font-medium text-neutral-900">
            {getDayName(day).substring(0, 2)}, {formatDate(day)}
          </div>
        ))}
      </div>
      
      {/* Time Slots */}
      <div className="divide-y divide-neutral-200">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-7 divide-x divide-neutral-200">
            {days.map((day, dayIndex) => {
              const slot = getSlotForDayAndHour(day, hour);
              
              return (
                <div key={dayIndex} className="relative h-20">
                  {slot ? (
                    <TimeSlot
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onClick={() => onSelectSlot(slot)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                      {hour}:00
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
