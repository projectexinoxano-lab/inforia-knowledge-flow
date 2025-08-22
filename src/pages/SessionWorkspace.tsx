import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2, Loader2, Sparkles, UserPlus, Brain } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePatient } from "@/hooks/usePatients";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { creditsService } from '@/services/credits';
import { googleDriveService } from '@/services/googleDrive';
import { useQueryClient } from '@tanstack/react-query';
import GoogleDriveIntegration from '@/components/GoogleDriveIntegration';

const SessionWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const patientId = searchParams.get('patientId');
  
  // Hook para obtener pacientes reales
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Estado para paciente seleccionado
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Si hay patientId en URL, seleccionar ese paciente
  useEffect(() => {
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [patientId, patients]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [reportType, setReportType] = useState<'primera_visita' | 'seguimiento'>('seguimiento');
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (!selectedPatient || !notes.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor selecciona un paciente y añade notas de la sesión",
        variant: "destructive"
      });
      return;
    }

    // VERIFICAR CRÉDITOS ANTES DE GENERAR
    const creditCheck = await creditsService.checkCanGenerateReport();
    if (!creditCheck.canGenerate) {
      toast({
        title: "Límite de informes alcanzado",
        description: creditCheck.message,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 Iniciando generación de informe...');
      
      // Llamada a Edge Function
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name,
          session_notes: notes.trim(),
          report_type: reportType,
          input_type: hasFinishedRecording ? 'voice' : 'text'
        }
      });

      if (error) {
        console.error('❌ Error al generar informe:', error);
        throw new Error(error.message || 'Error al generar informe');
      }

      if (!data?.success) {
        console.error('❌ Respuesta no exitosa:', data);
        throw new Error(data?.error || 'Error desconocido al generar informe');
      }

      console.log('✅ Informe generado exitosamente:', data.report.id);

      // DESPUÉS de generar exitosamente, consumir crédito
      await creditsService.consumeCredit();
      console.log('✅ Crédito consumido exitosamente');

      // Mensaje personalizado según donde se guardó
      const driveMessage = data.drive_status === 'saved_to_drive' 
        ? `El informe "${data.report.title}" se ha guardado en tu Google Drive`
        : `El informe "${data.report.title}" se ha creado correctamente`;

      toast({
        title: "¡Informe generado exitosamente!",
        description: driveMessage,
      });

      // Limpiar formulario
      setNotes('');
      setHasFinishedRecording(false);
      setFinalDuration('');
      setTimer("00:00");
      setSelectedPatient(null);
      
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['patient-reports', selectedPatient.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      // Navegar al perfil del paciente
      navigate(`/patient-detailed-profile?id=${selectedPatient.id}`);

    } catch (error) {
      console.error('💥 Error completo:', error);
      
      toast({
        title: "Error al generar informe",
        description: error instanceof Error ? error.message : "Error desconocido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    toast({
      title: "Borrador guardado",
      description: "Las notas de sesión se han guardado como borrador",
    });
  };

  if (loadingPatients) {
    return (
      <div className="min-h-screen bg-[#FBF9F6]">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#2E403B]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Global Header for consistency */}
      <NavigationHeader />

      {/* Main content - centered single column */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header - Context */}
          <div className="text-center space-y-4">
            <h1 className="font-lora text-3xl font-bold text-[#2E403B]">
              Espacio de Sesión Clínica
            </h1>
            <p className="text-[#333333]/70 font-nunito-sans">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Selector de Pacientes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-select" className="text-base font-medium text-[#2E403B] font-lora">
                Seleccionar Paciente
              </Label>
              <Select
                value={selectedPatient?.id || ""}
                onValueChange={(value) => {
                  const patient = patients.find(p => p.id === value);
                  setSelectedPatient(patient);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingPatients ? "Cargando pacientes..." : "Selecciona un paciente"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{patient.name}</span>
                        {patient.email && (
                          <span className="text-sm text-muted-foreground">({patient.email})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {patients.length === 0 && !loadingPatients && (
                    <SelectItem value="no-patients" disabled>
                      No hay pacientes. Crear uno primero.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPatient && (
              <Card className="p-4 bg-[#2E403B]/5 border-[#2E403B]/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#2E403B] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2E403B] font-lora">{selectedPatient.name}</h4>
                    <p className="text-sm text-[#333333]/70 font-nunito-sans">
                      {selectedPatient.email || 'Sin email'} • 
                      Creado: {new Date(selectedPatient.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!selectedPatient && (
              <div className="text-center py-8 text-[#333333]/70">
                <p className="font-nunito-sans">Selecciona un paciente para comenzar la sesión</p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-[#2E403B] text-[#2E403B] hover:bg-[#2E403B] hover:text-white"
                  onClick={() => window.location.href = '/new-patient'}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Nuevo Paciente
                </Button>
              </div>
            )}
          </div>
            
          {/* Report Type Selection */}
          {selectedPatient && (
            <div className="flex justify-center gap-4">
              <Button
                variant={reportType === 'primera_visita' ? 'default' : 'outline'}
                onClick={() => setReportType('primera_visita')}
                size="sm"
                className={reportType === 'primera_visita' ? 'bg-[#2E403B] hover:bg-[#800020]' : 'border-[#2E403B] text-[#2E403B] hover:bg-[#2E403B] hover:text-white'}
              >
                Primera Visita
              </Button>
              <Button
                variant={reportType === 'seguimiento' ? 'default' : 'outline'}
                onClick={() => setReportType('seguimiento')}
                size="sm"
                className={reportType === 'seguimiento' ? 'bg-[#2E403B] hover:bg-[#800020]' : 'border-[#2E403B] text-[#2E403B] hover:bg-[#2E403B] hover:text-white'}
              >
                Seguimiento
              </Button>
            </div>
          )}

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
          {selectedPatient && (
            <div className="space-y-4">
              <h2 className="font-lora text-xl font-bold text-[#2E403B]">
                Notas de Sesión
              </h2>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe aquí tus notas de la sesión. El sistema generará automáticamente un informe profesional basado en tu contenido."
                className="min-h-[400px] text-base resize-none font-nunito-sans border-[#2E403B]/20 focus:border-[#2E403B]"
              />
            </div>
          )}

          {/* Google Drive Integration Status */}
          <GoogleDriveIntegration className="mb-6" />

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
          {selectedPatient && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                variant="secondary"
                size="lg" 
                className="h-12 px-8 text-base font-medium border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white"
                onClick={handleSaveDraft}
                disabled={!notes.trim()}
              >
                Guardar Borrador
              </Button>
              <Button 
                size="lg" 
                className="h-12 px-8 text-base font-medium bg-[#2E403B] hover:bg-[#800020] text-white"
                onClick={handleGenerateReport}
                disabled={!selectedPatient || !notes.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando informe con IA...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generar Informe Inteligente
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;