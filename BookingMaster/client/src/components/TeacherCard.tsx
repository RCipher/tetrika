import { Button } from "@/components/ui/button";
import { Teacher } from "@shared/schema";
import { Star } from "lucide-react";

interface TeacherCardProps {
  teacher: Teacher;
  onSelect: () => void;
}

export default function TeacherCard({ teacher, onSelect }: TeacherCardProps) {
  return (
    <div className="teacher-card border rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start">
        <img 
          src={teacher.avatar} 
          alt={`Фото репетитора ${teacher.name}`} 
          className="w-16 h-16 rounded-full object-cover mr-4" 
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{teacher.name}</h3>
          <p className="text-sm text-neutral-600">{teacher.subject}, {teacher.grades}</p>
          <p className="text-sm text-neutral-600 mt-1">{teacher.email}</p>
          
          <div className="mt-2 flex items-center">
            <div className="flex items-center mr-2">
              <span className="text-amber-500 font-semibold text-sm">{teacher.rating}</span>
              <div className="flex ml-1">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
              </div>
            </div>
            <span className="text-sm text-neutral-600">{teacher.reviewCount} отзыва</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          teacher.isAvailable 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {teacher.isAvailable ? "Доступен" : "Недоступен"}
        </span>
        <Button 
          variant="ghost" 
          className="text-sm text-primary-600 font-medium hover:text-primary-500"
          onClick={onSelect}
          disabled={!teacher.isAvailable}
        >
          Выбрать время
        </Button>
      </div>
    </div>
  );
}
