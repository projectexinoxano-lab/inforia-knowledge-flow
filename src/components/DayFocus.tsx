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
    time: "10:00",
    patientName: "Paz García",
    status: "Pendiente"
  },
  {
    id: "2", 
    time: "12:30",
    patientName: "Marcos Alonso",
    status: "Pendiente"
  },
  {
    id: "3",
    time: "16:00", 
    patientName: "Ana Martínez",
    status: "Pendiente"
  }
];

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
    <div className="bg-card rounded-lg border border-module-border p-6">
      {/* Title */}
      <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
        Foco del Día: {currentDate}
      </h2>

      {/* Appointments List */}
      {mockAppointments.length > 0 ? (
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <div 
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-module-border transition-calm hover:shadow-sm"
            >
              <div className="flex items-center space-x-4">
                {/* Time */}
                <div className="text-lg font-medium text-foreground min-w-[60px]">
                  {appointment.time}
                </div>

                {/* Patient Name */}
                <div className="text-lg text-foreground">
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
              <Button className="font-medium">
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