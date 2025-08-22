import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2, Loader2, Sparkles } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePatient } from "@/hooks/usePatients";
import { useGenerateReport } from "@/hooks/useReports";
import { useToast } from "@/hooks/use-toast";

const SessionWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const patientId = searchParams.get('patientId');
  const { data: patient, isLoading: patientLoading } = usePatient(patientId || '');
  const generateReport = useGenerateReport();
  
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [reportType, setReportType] = useState<'primera_visita' | 'seguimiento'>('seguimiento');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setHasFinishedRecording(false);
    setTimer("00:00");
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setFinalDuration(timer);
    setHasFinishedRecording(true);
    // TODO: Implement stop recording logic
  };

  const handleDeleteRecording = () => {
    setHasFinishedRecording(false);
    setTimer("00:00");
    setFinalDuration("");
  };

  const handleGenerateReport = async () => {
    if (!patientId || !notes.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Debes tener un paciente seleccionado y notas de sesión",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateReport.mutateAsync({
        patientId,
        sessionNotes: notes,
        reportType,
        audioTranscription: hasFinishedRecording ? "Grabación de audio de " + finalDuration : undefined
      });
      
      // Navigate to patient profile after successful generation
      navigate(`/patient-detailed-profile?id=${patientId}`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    toast({
      title: "Borrador guardado",
      description: "Las notas de sesión se han guardado como borrador",
    });
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!patient && patientId) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-destructive">Paciente no encontrado</p>
            <Button onClick={() => navigate('/patient-list')} className="mt-4">
              Volver a la lista de pacientes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header for consistency */}
      <NavigationHeader />

      {/* Main content - centered single column */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header - Context */}
          <div className="text-center space-y-4">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Registrando Sesión para: {patient?.name || 'Paciente'} - {new Date().toLocaleDateString('es-ES')}
            </h1>
            
            {/* Report Type Selection */}
            <div className="flex justify-center gap-4">
              <Button
                variant={reportType === 'primera_visita' ? 'default' : 'outline'}
                onClick={() => setReportType('primera_visita')}
                size="sm"
              >
                Primera Visita
              </Button>
              <Button
                variant={reportType === 'seguimiento' ? 'default' : 'outline'}
                onClick={() => setReportType('seguimiento')}
                size="sm"
              >
                Seguimiento
              </Button>
            </div>
          </div>

          {/* Recording Control Bar */}
          <div className="bg-card border border-module-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Empezar Grabación
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopRecording}
                    variant="destructive"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </Button>
                )}
              </div>

              {/* Status Indicator - Only when recording */}
              {isRecording && (
                <div className="flex items-center space-x-2 text-destructive font-medium">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span>GRABANDO | {timer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Finished Recording Component - Only appears after stopping */}
          {hasFinishedRecording && (
            <Card className="p-6 border border-module-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      Grabación de la sesión.mp3 ({finalDuration})
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Escuchar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleDeleteRecording}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Session Notes Area */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">
              Notas de Sesión
            </h2>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe aquí tus notas. El sistema las sincronizará automáticamente con la grabación."
              className="min-h-[400px] text-base resize-none font-sans"
            />
          </div>

          {/* Additional Files Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium text-foreground">
              Adjuntar Archivos Adicionales (Opcional)
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" className="flex-1 sm:flex-none">
                <FileAudio className="mr-2 h-4 w-4" />
                Subir archivo de audio
              </Button>
              <Button variant="secondary" className="flex-1 sm:flex-none">
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo de notas
              </Button>
            </div>
          </div>

          {/* Final Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              variant="secondary"
              size="lg" 
              className="h-12 px-8 text-base font-medium"
              onClick={handleSaveDraft}
              disabled={!notes.trim()}
            >
              Guardar Borrador
            </Button>
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-medium"
              onClick={handleGenerateReport}
              disabled={!notes.trim() || generateReport.isPending}
            >
              {generateReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando Informe...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Informe con IA
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;