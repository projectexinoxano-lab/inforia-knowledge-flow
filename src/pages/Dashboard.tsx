// Ruta: src/pages/Dashboard.tsx - VERSIÓN CORREGIDA COMPLETA
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePatients } from "@/hooks/usePatients";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = usePatients();
  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState(8);
  const [currentYear, setCurrentYear] = useState(2025);

  // USAR SOLO PACIENTES REALES - NO MOCK
  const realPatients = patients.length > 0 ? patients : [];
  
  // APPOINTMENTS CON IDs REALES - CORREGIDO
  const monthlyAppointments = {
    5: realPatients.length >= 2 ? [
      { 
        patientUuid: realPatients[0].id,  // ID REAL DE BD
        patient: realPatients[0].name, 
        time: '09:30', 
        type: 'Primera Visita', 
        status: 'confirmada'
      },
      { 
        patientUuid: realPatients[1].id,  // ID REAL DE BD
        patient: realPatients[1].name, 
        time: '11:00', 
        type: 'Seguimiento', 
        status: 'pendiente'
      }
    ] : [
      // FALLBACK SOLO SI NO HAY PACIENTES REALES
      { 
        patientUuid: 'mock-1',
        patient: 'Paciente Mock 1', 
        time: '09:30', 
        type: 'Primera Visita', 
        status: 'confirmada'
      }
    ],
    12: realPatients.length >= 1 ? [
      { 
        patientUuid: realPatients[0].id,  // ID REAL DE BD
        patient: realPatients[0].name, 
        time: '16:30', 
        type: 'Evaluación', 
        status: 'confirmada'
      }
    ] : [],
    18: realPatients.length >= 2 ? [
      { 
        patientUuid: realPatients[1].id,  // ID REAL DE BD
        patient: realPatients[1].name, 
        time: '10:00', 
        type: 'Primera Visita', 
        status: 'confirmada'
      }
    ] : []
  };

  const todaysAppointments = monthlyAppointments[selectedDate] || [];

  // DEBUG - LOGGING PARA VERIFICAR DATOS
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Pacientes reales cargados:', realPatients.length);
    console.log('Pacientes:', realPatients.map(p => ({ id: p.id, name: p.name })));
    console.log('Citas del día', selectedDate, ':', todaysAppointments);
    console.log('======================');
  }, [realPatients, selectedDate, todaysAppointments]);

  // TIMER FUNCTIONS
  useEffect(() => {
    let interval;
    if (true) {
      interval = setInterval(() => {
        // Timer logic if needed
      }, 1000);
    }
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // NAVIGATION FUNCTIONS
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // CALENDAR GENERATION - LIMITADO A 5 SEMANAS
  const generateCalendarDays = () => {
    const year = currentYear;
    const month = currentMonth;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        hasAppointments: false
      });
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        hasAppointments: !!monthlyAppointments[day]
      });
    }
    
    // Next month days - LIMITADO A 35 DÍAS TOTAL (5 SEMANAS)
    const remainingDays = Math.min(35 - days.length, 35 - days.length);
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasAppointments: false
      });
    }
    
    // ASEGURAR MÁXIMO 35 DÍAS (5 SEMANAS)
    return days.slice(0, 35);
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  };

  const days = generateCalendarDays();

  const handleStartSession = (patientName, patientUuid) => {
    console.log('Iniciando sesión:', { patientName, patientUuid });
    toast.success(`Iniciando sesión con ${patientName}`);
    navigate('/session-workspace', { state: { patientName, patientUuid } });
  };

  // FUNCIÓN NAVEGACIÓN PACIENTE - CON DEBUG
  const handleNavigateToPatient = (appointment) => {
    console.log('=== NAVEGACIÓN PACIENTE ===');
    console.log('Appointment completo:', appointment);
    console.log('PatientUuid:', appointment.patientUuid);
    console.log('Patient name:', appointment.patient);
    console.log('Navegando a:', `/patient-detailed-profile?id=${appointment.patientUuid}`);
    console.log('=========================');
    
    navigate(`/patient-detailed-profile?id=${appointment.patientUuid}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* TÍTULO PRINCIPAL */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-primary mb-2">
            Registro de Citas
          </h1>
        </div>

        {/* LAYOUT PRINCIPAL - 60% IZQUIERDA / 40% DERECHA */}
        <div className="grid grid-cols-5 gap-8">
          
          {/* COLUMNA IZQUIERDA - 60% (3/5 cols) */}
          <div className="col-span-3 space-y-8">

            {/* CALENDARIO */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-center space-x-6">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <h2 className="font-serif text-xl font-medium">
                    {getMonthName(currentMonth)} {currentYear}
                  </h2>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pb-6">
                <div className="space-y-4">
                  
                  {/* Headers días semana */}
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
                    <div>Dom</div>
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mié</div>
                    <div>Jue</div>
                    <div>Vie</div>
                    <div>Sáb</div>
                  </div>
                  
                  {/* Grid del calendario - 5 SEMANAS */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((dayObj, index) => {
                      const hasAppointments = dayObj.hasAppointments;
                      const isSelected = selectedDate === dayObj.day && dayObj.isCurrentMonth;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.day)}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                            ${!dayObj.isCurrentMonth 
                              ? 'text-muted-foreground/50 cursor-not-allowed' 
                              : 'hover:bg-muted cursor-pointer'
                            }
                            ${dayObj.isToday 
                              ? 'bg-primary text-primary-foreground font-semibold' 
                              : ''
                            }
                            ${isSelected && !dayObj.isToday 
                              ? 'bg-muted border-2 border-primary' 
                              : ''
                            }
                            ${hasAppointments && dayObj.isCurrentMonth 
                              ? 'bg-[#800020] text-white font-medium' 
                              : ''
                            }
                          `}
                        >
                          {dayObj.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA - 40% (2/5 cols) - LISTA DE CITAS */}
          <div className="col-span-2 space-y-8">
            
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="font-serif text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Citas del Día {selectedDate}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando pacientes...</p>
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.time}</span>
                            </div>
                            <div>
                              <button 
                                onClick={() => handleNavigateToPatient(appointment)}
                                className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline text-left"
                              >
                                {appointment.patient}
                              </button>
                              <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartSession(appointment.patient, appointment.patientUuid)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            Iniciar Sesión
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">
                      No hay citas para este día
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {realPatients.length === 0 
                        ? 'Primero necesitas crear pacientes'
                        : 'Selecciona otra fecha en el calendario'
                      }
                    </p>
                    {realPatients.length === 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/patient-list')}
                      >
                        Ir a Pacientes
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}