import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Plus, Upload, FileAudio } from "lucide-react";

const SessionWorkspace = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement stop recording logic
  };

  const handleInsertTimestamp = () => {
    const timestamp = `[${timer}] `;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newNotes = notes.slice(0, start) + timestamp + notes.slice(end);
      setNotes(newNotes);
      
      // Set cursor position after the timestamp
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + timestamp.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with logo */}
      <header className="border-b border-module-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <h1 className="font-serif text-2xl font-medium text-primary">iNFORiA</h1>
        </div>
      </header>

      {/* Main content - centered single column */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header - Context */}
          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Registrando Sesión para: Paz García - 22 de julio de 2025
            </h1>
          </div>

          {/* Unified Control Bar */}
          <div className="bg-card border border-module-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              {/* Recording Controls */}
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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

              {/* Live Timer */}
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-foreground">
                  {timer} / 60:00
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRecording ? "Grabando..." : "Detenido"}
                </div>
              </div>

              {/* Timestamp Action */}
              <Button 
                variant="secondary"
                onClick={handleInsertTimestamp}
                disabled={!isRecording}
              >
                <Plus className="mr-2 h-4 w-4" />
                Insertar Timestamp en Notas
              </Button>
            </div>
          </div>

          {/* Session Notes Area */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">
              Notas de Sesión
            </h2>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe aquí tus notas. Usa el botón '+ Insertar Timestamp' para anclar una nota a un momento específico de la grabación."
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
            >
              Guardar Borrador
            </Button>
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generar Informe con IA
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionWorkspace;