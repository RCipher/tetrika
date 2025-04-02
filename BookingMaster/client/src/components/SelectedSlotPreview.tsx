import { Button } from "@/components/ui/button";
import { TimeSlot, Teacher } from "@shared/schema";
import { formatDateTimeRange } from "@/lib/dates";

interface SelectedSlotPreviewProps {
  slot: TimeSlot;
  teacher: Teacher;
  onContinue: () => void;
}

export default function SelectedSlotPreview({ 
  slot, 
  teacher, 
  onContinue 
}: SelectedSlotPreviewProps) {
  return (
    <div className="mt-8">
      <div className="bg-primary-50 p-4 rounded-lg">
        <h3 className="font-medium text-neutral-900">Выбранное время</h3>
        <div className="mt-2 flex flex-wrap md:flex-nowrap">
          <div className="mr-8 mb-2 md:mb-0">
            <p className="text-sm text-neutral-700">Репетитор:</p>
            <p className="font-medium">{teacher.name}</p>
          </div>
          <div className="mr-8 mb-2 md:mb-0">
            <p className="text-sm text-neutral-700">Предмет:</p>
            <p className="font-medium">{teacher.subject}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-700">Дата и время:</p>
            <p className="font-medium">{formatDateTimeRange(slot)}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white"
            onClick={onContinue}
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
