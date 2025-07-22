import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Upload } from "lucide-react";

const SessionWorkspace = () => {
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
        <div className="space-y-12">
          {/* Page Header - Context */}
          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
              Registrando Sesión para: Paz García
            </h1>
            <p className="text-lg text-muted-foreground">
              22 de julio de 2025, 10:00
            </p>
          </div>

          {/* Section 1: Voice Input */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              1. Entrada de Voz
            </h2>
            
            <div className="border-2 border-dashed border-dropzone-border bg-dropzone-background rounded-lg p-12">
              <div className="flex flex-col items-center space-y-6">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base font-medium"
                >
                  <Mic className="mr-3 h-5 w-5" />
                  Iniciar Grabación
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  O subir archivo de audio
                </Button>
              </div>
            </div>
          </section>

          {/* Section 2: Notes Input */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              2. Entrada de Notas
            </h2>
            
            <div className="space-y-4">
              <Textarea 
                placeholder="Escriba sus notas de la sesión aquí..."
                className="min-h-[200px] text-base resize-none"
              />
              
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo de notas (PDF, DOCX, etc.)
              </Button>
            </div>
          </section>

          {/* Final Action */}
          <div className="flex justify-center pt-8">
            <Button 
              size="lg" 
              className="h-14 px-12 text-lg font-medium"
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