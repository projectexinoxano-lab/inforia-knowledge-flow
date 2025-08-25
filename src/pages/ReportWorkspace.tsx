import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReportGenerator } from '@/components/ReportGenerator';
import { Header } from '@/components/Header';
import { ArrowLeft, User } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';

export default function ReportWorkspace() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { data: patients = [], isLoading: loading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        setSelectedPatientId(patientId);
      }
    }
  }, [patientId, patients]);

  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === selectedPatientId);
      setSelectedPatient(patient || null);
    }
  }, [selectedPatientId, patients]);

  const handleReportGenerated = (reportId: string) => {
    toast.success('Informe generado exitosamente');
    // Opcional: navegar a ver el informe o mantener en el workspace
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Cargando pacientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-semibold text-primary">
              Espacio de Trabajo - Informes
            </h1>
            <p className="text-muted-foreground">
              Genera informes clínicos profesionales con asistencia de IA
            </p>
          </div>
        </div>

        {/* Selección de paciente */}
        {!patientId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seleccionar Paciente
              </CardTitle>
              <CardDescription>
                Elige el paciente para el cual deseas generar un informe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No tienes pacientes registrados. <br />
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary underline"
                      onClick={() => navigate('/patients/new')}
                    >
                      Crear tu primer paciente
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{patient.name}</span>
                          {patient.birth_date && (
                            <Badge variant="outline" className="ml-2">
                              {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} años
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        )}

        {/* Información del paciente seleccionado */}
        {selectedPatient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedPatient.name}
              </CardTitle>
              <CardDescription>
                {selectedPatient.birth_date && (
                  <span>
                    Edad: {new Date().getFullYear() - new Date(selectedPatient.birth_date).getFullYear()} años
                  </span>
                )}
                {selectedPatient.email && (
                  <span className="ml-4">Email: {selectedPatient.email}</span>
                )}
              </CardDescription>
            </CardHeader>
            {selectedPatient.notes && (
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Notas del paciente:</h4>
                  <p className="text-sm text-muted-foreground">{selectedPatient.notes}</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Generador de informes */}
        {selectedPatientId ? (
          <ReportGenerator
            patientId={selectedPatientId}
            patientName={selectedPatient?.name}
            onReportGenerated={handleReportGenerated}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un paciente para comenzar a generar informes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}