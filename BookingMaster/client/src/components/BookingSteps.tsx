import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface BookingStepsProps {
  currentStep: number;
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  const steps = [
    { id: 1, name: "Шаг 1", path: "/booking" },
    { id: 2, name: "Шаг 2", path: "#" },
    { id: 3, name: "Шаг 3", path: "#" },
  ];

  return (
    <div className="py-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="flex flex-col items-center"
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1",
                  step.id === currentStep
                    ? "bg-primary-600 text-white"
                    : step.id < currentStep 
                      ? "bg-primary-600 text-white" 
                      : "bg-white border border-gray-300 text-gray-500"
                )}
              >
                {step.id < currentStep ? "✓" : step.id}
              </div>
              <span className={cn(
                "text-xs",
                step.id === currentStep
                  ? "text-primary-600 font-medium"
                  : "text-gray-500"
              )}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-gray-200 rounded-full">
          <div 
            className="absolute top-0 left-0 h-1 bg-primary-600 rounded-full" 
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
