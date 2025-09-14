// Ruta: src/components/ReportGenerator.tsx (corregir import Alert)
import React from 'react';
import { creditsService } from '@/services/credits';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert'; // CORRECTO: de shadcn/ui
import { AlertCircle } from 'lucide-react'; // CORRECTO: solo el ícono

export function ReportGenerator() {
  const { data: profile, refreshProfile } = useUserProfile();

  const handleGenerateReport = async () => {
    try {
      // CRÍTICO: Verificar límite antes de generar
      const { canGenerate, message } = await creditsService.checkCanGenerateReport();
      
      if (!canGenerate) {
        alert(message); // TODO: Reemplazar con toast/modal profesional
        return;
      }

      // Generar informe...
      // [Lógica existente de generación]
      
      // CRÍTICO: Consumir crédito tras generación exitosa
      const creditConsumed = await creditsService.consumeCredit(() => {
        refreshProfile(); // Refrescar contador inmediatamente
      });

      if (!creditConsumed) {
        throw new Error('Error al actualizar contador de informes');
      }

      // Éxito - mostrar feedback al usuario
      // [Resto de lógica]

    } catch (error) {
      console.error('Error generando informe:', error);
      alert('Error: ' + error.message);
    }
  };

  if (!profile) return null;

  const canGenerate = profile.credits_used < profile.credits_limit;

  return (
    <div className="space-y-4">
      {!canGenerate && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has utilizado {profile.credits_used}/{profile.credits_limit} informes. Actualiza tu plan para continuar.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleGenerateReport}
        disabled={!canGenerate}
        className="w-full"
      >
        Generar Informe ({profile.credits_limit - profile.credits_used} restantes)
      </Button>
    </div>
  );
}