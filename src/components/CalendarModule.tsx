import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const CalendarModule = () => {
  const [currentView, setCurrentView] = useState<"Día" | "Semana" | "Mes">("Semana");
  const [currentDate, setCurrentDate] = useState(new Date());

  const views = ["Día", "Semana", "Mes"] as const;

  // Generate week days for demo
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1));
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00"
  ];

  // Sample appointments
  const appointments = [
    { id: 1, time: "10:00", title: "Sesión con Ana M.", day: 1 },
    { id: 2, time: "14:00", title: "Evaluación inicial", day: 3 },
    { id: 3, time: "16:00", title: "Terapia familiar", day: 5 },
  ];

  return (
    <Card className="h-full bg-module-background border-module-border p-6 rounded-xl">
      {/* Module Title */}
      <div className="mb-6">
        <h2 className="module-title mb-4">Calendario</h2>
        
        {/* View Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {views.map((view) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(view)}
                className={`font-sans transition-calm ${
                  currentView === view 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary"
                }`}
              >
                {view}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-secondary transition-calm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-sans font-medium text-sm min-w-32 text-center">
              {currentDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-secondary transition-calm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Nueva Cita Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium transition-calm mb-4"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Calendar Grid - Week View */}
      <div className="flex-1 overflow-hidden">
        {currentView === "Semana" && (
          <div className="h-full">
            {/* Week Header */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-xs font-sans text-muted-foreground"></div>
              {weekDays.map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-xs font-sans text-muted-foreground mb-1">{day}</div>
                  <div className={`text-sm font-sans font-medium w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    currentWeek[index].toDateString() === new Date().toDateString()
                      ? "bg-calendar-today text-white"
                      : "text-foreground"
                  }`}>
                    {currentWeek[index].getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="custom-scrollbar overflow-y-auto" style={{ height: "calc(100% - 80px)" }}>
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-2 h-12 border-b border-muted/30">
                  <div className="text-xs font-sans text-muted-foreground py-2 pr-2 text-right">
                    {time}
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const appointment = appointments.find(
                      apt => apt.time === time && apt.day === dayIndex
                    );
                    
                    return (
                      <div 
                        key={`${time}-${dayIndex}`} 
                        className="border-r border-muted/20 hover:bg-calendar-hover transition-calm cursor-pointer p-1"
                      >
                        {appointment && (
                          <div className="bg-primary text-primary-foreground text-xs p-2 rounded-lg font-sans">
                            <div className="font-medium truncate">{appointment.title}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month View Placeholder */}
        {currentView === "Mes" && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-sans">Vista mensual próximamente</p>
            </div>
          </div>
        )}

        {/* Day View Placeholder */}
        {currentView === "Día" && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-sans">Vista diaria próximamente</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};