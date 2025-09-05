// Ruta: src/pages/Dashboard.tsx
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Mic, Send, Plus, ChevronLeft, ChevronRight, Clock, Square, UserPlus, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [reportType, setReportType] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(8);
  const [currentYear, setCurrentYear] = useState(2025);

  // GENERAR UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // LISTA DE PACIENTES
  const [patientsList, setPatientsList] = useState([
    { 
      uuid: 'bd8c8984-3d48-41f0-9042-2418645515b0', 
      name: 'Miguel Utge Buil', 
      value: 'miguel',
      isActive: true,
      createdAt: new Date(2025, 8, 1)
    },
    { 
      uuid: 'f7e9d8c6-5b4a-3928-8176-9e5f4d3c2b1a', 
      name: 'Antonio ras ras', 
      value: 'antonio',
      isActive: true,
      createdAt: new Date(2025, 7, 15)
    },
    { 
      uuid: 'a3b2c1d0-9e8f-7654-3210-fedcba987654', 
      name: 'XXWS XWSX7', 
      value: 'xxws',
      isActive: false,
      createdAt: new Date(2025, 8, 10)
    },
    { 
      uuid: '12345678-90ab-cdef-1234-567890abcdef', 
      name: 'Ana García', 
      value: 'ana',
      isActive: true,
      createdAt: new Date(2025, 8, 20)
    },
    { 
      uuid: '98765432-10fe-dcba-9876-543210fedcba', 
      name: 'Carlos Ruiz', 
      value: 'carlos',
      isActive: true,
      createdAt: new Date(2025, 6, 5)
    }
  ]);

  // ESTADÍSTICAS DE PACIENTES
  const totalPacientes = patientsList.length;
  const pacientesActivos = patientsList.filter(p => p.isActive).length;
  const nuevosEsteMes = patientsList.filter(p => {
    const now = new Date();
    return p.createdAt.getMonth() === now.getMonth() && p.createdAt.getFullYear() === now.getFullYear();
  }).length;

  // APPOINTMENTS DATA
  const monthlyAppointments = {
    5: [
      { 
        patientUuid: 'bd8c8984-3d48-41f0-9042-2418645515b0',
        patient: 'Miguel Utge Buil', 
        time: '09:30', 
        type: 'Primera Visita', 
        status: 'Confirmada' 
      },
      { 
        patientUuid: 'f7e9d8c6-5b4a-3928-8176-9e5f4d3c2b1a',
        patient: 'Antonio ras ras', 
        time: '11:00', 
        type: 'Seguimiento', 
        status: 'Pendiente' 
      }
    ],
    7: [{ 
      patientUuid: 'a3b2c1d0-9e8f-7654-3210-fedcba987654',
      patient: 'XXWS XWSX7', 
      time: '16:00', 
      type: 'Evaluación' 
    }],
    12: [{ 
      patientUuid: 'bd8c8984-3d48-41f0-9042-2418645515b0',
      patient: 'Miguel Utge Buil', 
      time: '10:00', 
      type: 'Seguimiento' 
    }]
  };

  const todaysAppointments = monthlyAppointments[selectedDate] || [];

  // AGREGAR NUEVO PACIENTE
  const addNewPatient = (patientData) => {
    const newUuid = generateUUID();
    const newPatient = {
      uuid: newUuid,
      name: patientData.name,
      value: patientData.name.toLowerCase().replace(/\s+/g, ''),
      isActive: true,
      createdAt: new Date()
    };

    setPatientsList(prev => [newPatient, ...prev]);
    toast.success(`${patientData.name} agregado como nuevo paciente`);
    return newUuid;
  };

  // SIMULAR NUEVO PACIENTE
  const simulateNewPatient = () => {
    const mockPatient = {
      name: `Paciente Test ${Date.now()}`,
      appointmentTime: '16:00',
      type: 'Primera Visita'
    };
    addNewPatient(mockPatient);
  };

  // Timer para grabación
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // FUNCIONES
  const handleStartSession = (patientName, patientUuid) => {
    console.log('Iniciando sesión:', { patientName, patientUuid });
    toast.success(`Iniciando sesión con ${patientName}`);
    navigate('/session-workspace', { state: { patientName, patientUuid } });
  };

  const handleScheduleAppointment = () => {
    console.log('Navegando a nuevo paciente');
    toast.success('Abriendo formulario para nuevo paciente');
    navigate('/new-patient');
  };

  const handleViewAllPatients = () => {
    console.log('Navegando a lista completa de pacientes');
    toast.success('Abriendo lista completa de pacientes');
    navigate('/patient-list');
  };

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
      toast.success(`Grabación guardada: ${formatTime(recordingTime)}`);
      setNotes(prev => prev + `\n[Transcripción automática - ${formatTime(recordingTime)}]\n`);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      toast.success('Grabación iniciada');
    }
  };

  const handleGenerateReport = () => {
    if (!selectedPatient) {
      toast.error('Por favor selecciona un paciente');
      return;
    }
    if (!notes.trim()) {
      toast.error('Por favor escribe algunas notas de la sesión');
      return;
    }
    
    toast.success('Generando informe con IA...');
    
    setTimeout(() => {
      toast.success('¡Informe generado exitosamente!');
      setSelectedPatient('');
      setReportType('');
      setNotes('');
    }, 2000);
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayNum = currentDateObj.getDate();
      const monthNum = currentDateObj.getMonth();
      const isCurrentMonth = monthNum === currentMonth;
      const hasAppointments = isCurrentMonth && monthlyAppointments[dayNum];
      
      days.push({
        date: dayNum,
        month: monthNum,
        year: currentDateObj.getFullYear(),
        isCurrentMonth,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        hasAppointments
      });
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleDateSelect = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDate(day);
      toast.info(`Fecha seleccionada: ${day} de ${getMonthName(currentMonth)}`);
    }
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  };

  const days = generateCalendarDays();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-primary mb-2">
            Puesto de Mando Clínico
          </h1>
          <p className="font-sans text-muted-foreground">
            Tu centro de control profesional para la gestión de consulta
          </p>
          
          <Button 
            onClick={simulateNewPatient}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            [TEST] Simular Nuevo Paciente
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-8">
            
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
                  <CardTitle className="font-serif text-xl text-center min-w-[180px]">
                    {getMonthName(currentMonth)} {currentYear}
                  </CardTitle>
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
              
              <CardContent className="pb-8">
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                      <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const isSelected = day.date === selectedDate && day.isCurrentMonth;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date, day.isCurrentMonth)}
                          className={`h-12 text-sm rounded-lg transition-all duration-200 font-medium relative
                            ${day.isCurrentMonth 
                              ? 'text-foreground hover:bg-muted' 
                              : 'text-muted-foreground/40'
                            }
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : ''
                            }
                            ${day.isToday && !isSelected
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : ''
                            }
                          `}
                        >
                          {day.date}
                          {day.hasAppointments && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-white' : 'bg-[#800020]'
                                }`}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CITAS DEL DÍA */}
            <Card className="border-0 shadow-lg h-[350px] flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-xl flex items-center">
                      <Calendar className="mr-3 h-5 w-5" />
                      Citas del {selectedDate} de {getMonthName(currentMonth)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {todaysAppointments.length === 0 
                        ? 'No hay citas programadas' 
                        : `${todaysAppointments.length} cita${todaysAppointments.length > 1 ? 's' : ''} programada${todaysAppointments.length > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleScheduleAppointment}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-6 overflow-y-auto">
                {todaysAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Calendar className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">No hay citas para este día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysAppointments.map((appointment, index) => (
                      <div key={index} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-800">
                                {appointment.patient.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{appointment.patient}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{appointment.time}</span>
                                </div>
                                <Badge variant="outline" className="text-xs h-5">
                                  {appointment.type}
                                </Badge>
                                {appointment.status && (
                                  <Badge className={`text-xs h-5 ${
                                    appointment.status === 'Confirmada' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {appointment.status}
                                  </Badge>
                                )}
                              </div>
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-8">
            
            {/* REDACTAR INFORME */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="font-serif text-xl">Redactar Informe</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Genera informes inteligentes con IA desde tus notas de sesión
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6 pb-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Paciente 
                    <span className="text-xs text-muted-foreground ml-2">
                      ({patientsList.length} pacientes disponibles)
                    </span>
                  </label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsList.map((patient) => (
                        <SelectItem key={patient.uuid} value={patient.value}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Tipo de Informe</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seguimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primera">Primera Visita</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Notas de la Sesión</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe las notas de la sesión o utiliza la grabación de voz..."
                    className="h-32 resize-none"
                  />
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 p-3 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-700">
                      Grabando: {formatTime(recordingTime)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant={isRecording ? "destructive" : "outline"}
                    className="flex items-center"
                    onClick={handleStartRecording}
                  >
                    {isRecording ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Parar Grabación
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Grabar
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex items-center bg-primary hover:bg-primary/90"
                    onClick={handleGenerateReport}
                    disabled={!selectedPatient || !notes.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Generar Informe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* LISTA PACIENTES - SIN INFORMACIÓN DEL PORCENTAJE */}
            <Card className="border-0 shadow-lg h-[350px] flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl flex items-center">
                    <Users className="mr-3 h-5 w-5" />
                    Lista Pacientes
                  </CardTitle>
                  <Button 
                    onClick={handleViewAllPatients}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Ver Lista Completa
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-6">
                <div className="space-y-6">
                  
                  {/* Estadísticas en Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    
                    {/* Total Pacientes */}
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{totalPacientes}</div>
                      <div className="text-xs text-muted-foreground">Total Pacientes</div>
                    </div>

                    {/* Pacientes Activos */}
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-700">{pacientesActivos}</div>
                      <div className="text-xs text-green-600">Activos</div>
                    </div>

                    {/* Nuevos Este Mes */}
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <UserPlus className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{nuevosEsteMes}</div>
                      <div className="text-xs text-blue-600">Nuevos Este Mes</div>
                    </div>
                  </div>

                  {/* Acceso Rápido */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => navigate('/new-patient')}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="text-sm">Nuevo Paciente</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={handleViewAllPatients}
                    >
                      <Users className="h-5 w-5" />
                      <span className="text-sm">Gestionar Lista</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}