import { useState, useCallback } from "react";
import { Upload, FileText, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const ReportModule = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('audio/') || 
      file.type.startsWith('text/') ||
      file.type === 'application/pdf'
    );

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Archivos cargados",
        description: `${validFiles.length} archivo(s) añadido(s) correctamente`,
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      toast({
        title: "Archivos seleccionados",
        description: `${selectedFiles.length} archivo(s) añadido(s) correctamente`,
      });
    }
  };

  const generateReport = () => {
    if (files.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Por favor, añade al menos un archivo para generar el informe",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generando informe...",
      description: "La IA está procesando tus archivos. Esto puede tomar unos momentos.",
    });
  };

  return (
    <Card className="bg-module-background border-module-border p-6 rounded-xl">
      <h2 className="module-title mb-6">Redactar Informe</h2>
      
      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-calm mb-6 ${
          isDragging
            ? "border-primary bg-dropzone-active"
            : "border-dropzone-border bg-dropzone-background hover:bg-dropzone-active hover:border-primary"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="p-3 bg-card rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="p-3 bg-card rounded-full">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div className="p-3 bg-card rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div>
            <p className="font-sans font-medium text-foreground mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              Admite archivos de audio, texto y documentos PDF
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="audio/*,.txt,.pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-sans font-medium cursor-pointer transition-calm"
          >
            Seleccionar archivos
          </label>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="font-sans font-medium text-sm text-foreground mb-3">
            Archivos cargados ({files.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-module-border"
              >
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      <Button
        onClick={generateReport}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium transition-calm"
        size="lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generar Informe Inteligente
      </Button>
    </Card>
  );
};