import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CalendarDay {
  date: number;
  hasAppointments: boolean;
  appointments?: Array<{
    time: string;
    patientName: string;
  }>;
}

const CalendarModule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Ajuste para que lunes sea 0

    const days: CalendarDay[] = [];

    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, hasAppointments: false });
    }

    // Add days of the month with mock appointment data
    for (let day = 1; day <= daysInMonth; day++) {
      const hasAppointments = day === 22 || day === 25 || day === 28; // Mock data
      const appointments = hasAppointments ? [
        { time: "10:00", patientName: "Paz García" },
        { time: "12:30", patientName: "Marcos Alonso" }
      ] : undefined;

      days.push({
        date: day,
        hasAppointments,
        appointments
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="bg-card rounded-lg border border-module-border p-8 w-full h-full">
      {/* Title */}
      <h3 className="font-serif text-2xl font-medium text-foreground mb-6 text-center">
        Calendario
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-background rounded-lg p-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigateMonth("prev")}
          className="h-12 w-12 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <span className="text-xl font-semibold text-foreground px-4">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigateMonth("next")}
          className="h-12 w-12 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-base font-semibold text-primary py-3 bg-background rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center relative min-h-[60px]">
            {day.date > 0 && (
              <>
                {day.hasAppointments && day.appointments ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="w-full h-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-calendar-hover rounded-lg transition-calm relative bg-background border-2 border-transparent hover:border-primary hover:shadow-lg">
                        {day.date}
                        <div 
                          className="absolute top-2 right-2 w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: "#800020" }}
                        />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto p-4" side="top">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Citas del día</h4>
                        {day.appointments.map((appointment, idx) => (
                          <div key={idx} className="text-sm p-2 bg-background rounded border">
                            <span className="font-medium text-primary">{appointment.time}</span> - {appointment.patientName}
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-medium text-foreground hover:bg-calendar-hover rounded-lg transition-calm bg-background border-2 border-transparent hover:border-muted">
                    {day.date}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarModule;