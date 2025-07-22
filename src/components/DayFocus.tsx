import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  status: "Pendiente" | "Completada" | "En Curso";
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    time: "09:00",
    patientName: "Carmen López",
    status: "Pendiente"
  },
  {
    id: "2",
    time: "10:00",
    patientName: "Paz García",
    status: "Pendiente"
  },
  {
    id: "3", 
    time: "12:30",
    patientName: "Marcos Alonso",
    status: "Pendiente"
  },
  {
    id: "4",
    time: "14:00",
    patientName: "Ana Martínez",
    status: "Pendiente"
  },
  {
    id: "5",
    time: "16:00", 
    patientName: "Luis Rodríguez",
    status: "Pendiente"
  },
  {
    id: "6",
    time: "17:30", 
    patientName: "Sofia Hernández",
    status: "Pendiente"
  }
];

// Mostrar solo los primeros 5 pacientes
const displayedAppointments = mockAppointments.slice(0, 5);

const DayFocus = () => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-400";
      case "En Curso":
        return "bg-blue-400";
      case "Completada":
        return "bg-green-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-module-border p-8 w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-medium text-foreground">
          Foco del Día: {currentDate}
        </h2>
      </div>

      {/* Appointments List */}
      {displayedAppointments.length > 0 ? (
        <div className="space-y-6">
          {displayedAppointments.map((appointment) => (
            <div 
              key={appointment.id}
              className="flex items-center justify-between p-6 bg-background rounded-lg border border-module-border transition-calm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                {/* Time */}
                <div className="text-xl font-semibold text-foreground min-w-[70px]">
                  {appointment.time}
                </div>

                {/* Patient Name */}
                <div className="text-xl text-foreground font-medium">
                  {appointment.patientName}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
                  <span className="text-sm text-muted-foreground">
                    {appointment.status}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button size="lg" className="font-medium px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                Registrar Sesión
              </Button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Hoy no tienes citas programadas. ¡Un día perfecto para planificar!
          </p>
        </div>
      )}
    </div>
  );
};

export default DayFocus;