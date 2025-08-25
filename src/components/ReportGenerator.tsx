import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mic, MicOff, FileText, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ReportsService } from '@/services/reports';
import { useAuth } from '@/contexts/AuthContext';

interface ReportGeneratorProps {
  patientId?: string;
  patientName?: string;
  onReportGenerated?: (reportId: string) => void;
}

export function ReportGenerator({ patientId, patientName, onReportGenerated }: ReportGeneratorProps) {
  const { profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [textNotes, setTextNotes] = useState('');
  const [reportType, setReportType] = useState<'primera_visita' | 'seguimiento'>('primera_visita');
  const [inputType, setInputType] = useState<'audio' | 'text'>('text');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Grabación iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Error al iniciar la grabación. Verifica los permisos del micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Grabación finalizada');
    }
  };

  const transcribeAudio = async () => {
    if (!recordedBlob) {
      toast.error('No hay audio grabado para transcribir');
      return;
    }

    setIsTranscribing(true);
    try {
      // Convertir blob a archivo
      const audioFile = new File([recordedBlob], 'session_audio.webm', { type: 'audio/webm' });
      
      const response = await ReportsService.transcribeAudio(audioFile);
      
      if (response.success && response.transcription) {
        setTranscription(response.transcription);
        toast.success('Audio transcrito correctamente');
      } else {
        throw new Error(response.error || 'Error en la transcripción');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Error al transcribir el audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateReport = async () => {
    if (!patientId) {
      toast.error('Debe seleccionar un paciente');
      return;
    }

    const content = inputType === 'audio' ? transcription : textNotes;
    if (!content.trim()) {
      toast.error('Debe proporcionar contenido para generar el informe');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await ReportsService.generateReport({
        patientId,
        reportType,
        inputType,
        audioTranscription: inputType === 'audio' ? transcription : undefined,
        textNotes: inputType === 'text' ? textNotes : undefined,
      });

      if (response.success && response.report) {
        setGeneratedReport(response.report.content);
        toast.success('Informe generado exitosamente');
        
        if (onReportGenerated) {
          onReportGenerated(response.report.id);
        }
      } else {
        throw new Error(response.error || 'Error generando el informe');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Error al generar el informe');
    } finally {
      setIsGenerating(false);
    }
  };

  const creditsRemaining = profile ? profile.credits_limit - profile.credits_used : 0;

  return (
    <div className="space-y-6">
      {/* Estado de créditos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Generador de Informes IA</CardTitle>
              <CardDescription>
                {patientName && `Generando informe para: ${patientName}`}
              </CardDescription>
            </div>
            <Badge variant={creditsRemaining > 10 ? "default" : "destructive"}>
              {creditsRemaining} / {profile?.credits_limit || 0} créditos
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {creditsRemaining <= 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has agotado tus créditos disponibles. Contacta con soporte para renovar tu plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuración del informe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración del Informe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Informe</label>
              <Select value={reportType} onValueChange={(value: 'primera_visita' | 'seguimiento') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primera_visita">Primera Visita</SelectItem>
                  <SelectItem value="seguimiento">Sesión de Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Entrada</label>
              <Select value={inputType} onValueChange={(value: 'audio' | 'text') => setInputType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Notas de Texto</SelectItem>
                  <SelectItem value="audio">Grabación de Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido de entrada */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido de la Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'audio' | 'text')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas de Texto
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Grabación de Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
              <Textarea
                placeholder="Escribe aquí las notas de la sesión..."
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </TabsContent>

            <TabsContent value="audio" className="space-y-4 mt-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-5 w-5 mr-2" />
                        Detener Grabación
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Iniciar Grabación
                      </>
                    )}
                  </Button>
                  
                  {recordedBlob && (
                    <Button
                      onClick={transcribeAudio}
                      disabled={isTranscribing}
                      variant="outline"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Transcribiendo...
                        </>
                      ) : (
                        'Transcribir Audio'
                      )}
                    </Button>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Grabando...</span>
                  </div>
                )}

                {transcription && (
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2">Transcripción:</label>
                    <Textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botón de generación */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={generateReport}
            disabled={isGenerating || creditsRemaining <= 0 || !patientId}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando Informe con IA...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Generar Informe Clínico
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Informe Generado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedReport}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}