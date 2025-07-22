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
    const startingDayOfWeek = firstDay.getDay();

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
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="bg-card rounded-lg border border-module-border p-6">
      {/* Title */}
      <h3 className="font-serif text-xl font-medium text-foreground mb-4">
        Calendario
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-lg font-medium text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center relative">
            {day.date > 0 && (
              <>
                {day.hasAppointments && day.appointments ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="w-full h-full flex items-center justify-center text-sm text-foreground hover:bg-calendar-hover rounded-md transition-calm relative">
                        {day.date}
                        <div 
                          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#800020" }}
                        />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto p-3" side="top">
                      <div className="space-y-1">
                        {day.appointments.map((appointment, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{appointment.time}</span> - {appointment.patientName}
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-foreground hover:bg-calendar-hover rounded-md transition-calm">
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