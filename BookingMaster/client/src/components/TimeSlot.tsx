import { cn } from "@/lib/utils";
import { TimeSlot as TimeSlotType } from "@shared/schema";

interface TimeSlotProps {
  slot: TimeSlotType;
  isSelected: boolean;
  onClick: () => void;
}

export default function TimeSlot({ slot, isSelected, onClick }: TimeSlotProps) {
  // Define classes based on status
  const baseClasses = "time-slot h-full p-2";
  
  const statusClasses = slot.isBooked
    ? "booked bg-red-50 border-l-4 border-red-500 opacity-70 cursor-not-allowed"
    : "available bg-green-50 border-l-4 border-green-500 cursor-pointer hover:transform hover:scale-[1.03] transition-all";
  
  const selectedClasses = isSelected && !slot.isBooked
    ? "selected bg-primary-100 border-primary-500"
    : "";
  
  return (
    <div 
      className={cn(baseClasses, statusClasses, selectedClasses)}
      onClick={slot.isBooked ? undefined : onClick}
    >
      <div className="text-sm font-medium">
        {slot.startTime} - {slot.endTime}
      </div>
      <div className="text-xs text-neutral-600">
        {slot.isBooked ? "Занято" : slot.subject}
      </div>
    </div>
  );
}
