import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Report, ReportInsert } from '@/services/database';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          patients!inner(
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const usePatientReports = (patientId: string) => {
  return useQuery({
    queryKey: ['reports', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      patientId, 
      sessionNotes, 
      reportType = 'seguimiento',
      audioTranscription 
    }: { 
      patientId: string; 
      sessionNotes: string; 
      reportType?: string;
      audioTranscription?: string;
    }) => {
      // First create a draft report
      const { data: draftReport, error: draftError } = await supabase
        .from('reports')
        .insert({
          patient_id: patientId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          title: `Informe ${reportType === 'primera_visita' ? 'Primera Visita' : 'de Seguimiento'} - ${new Date().toLocaleDateString('es-ES')}`,
          report_type: reportType,
          input_type: audioTranscription ? 'audio' : 'text',
          status: 'generating',
          audio_transcription: audioTranscription || null,
        })
        .select()
        .single();

      if (draftError) throw draftError;

      // Call the edge function to generate the report
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          patientId,
          sessionNotes,
          reportType,
          reportId: draftReport.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Informe generado",
        description: "El informe se ha generado correctamente con IA",
      });
    },
    onError: (error: any) => {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Error al generar el informe: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Report> }) => {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Informe actualizado",
        description: "El informe se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el informe",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Informe eliminado",
        description: "El informe se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el informe",
        variant: "destructive",
      });
    },
  });
};