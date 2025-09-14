// Ruta: src/services/credits.ts (actualizado con callback de refresh)
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name?: string;
  plan_type: string;
  credits_used: number;
  credits_limit: number;
  subscription_status: string;
}

export const creditsService = {
  async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async consumeCredit(onSuccess?: () => void): Promise<boolean> {
    const profile = await this.getUserProfile();
    if (!profile) return false;

    const newCreditsUsed = profile.credits_used + 1;
    
    // CRÍTICO: Verificar límite antes de permitir generación
    if (newCreditsUsed > profile.credits_limit) {
      throw new Error('Límite de créditos excedido. Actualiza tu plan para continuar.');
    }

    // Actualizar contador (MONETIZACIÓN CRÍTICA)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        credits_used: newCreditsUsed,
        subscription_status: this.calculateStatus(newCreditsUsed, profile.credits_limit),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating credits:', error);
      return false;
    }

    // Ejecutar callback para refrescar UI
    if (onSuccess) {
      onSuccess();
    }

    return true;
  },

  calculateStatus(used: number, limit: number): 'active' | 'warning' | 'over_quota' {
    const percentage = (used / limit) * 100;
    
    if (percentage >= 100) return 'over_quota';
    if (percentage >= 90) return 'warning';
    return 'active';
  },

  async checkCanGenerateReport(): Promise<{ canGenerate: boolean; message?: string }> {
    const profile = await this.getUserProfile();
    
    if (!profile) {
      return { canGenerate: false, message: 'Error al verificar perfil de usuario' };
    }

    if (profile.credits_used >= profile.credits_limit) {
      return { 
        canGenerate: false, 
        message: 'Has alcanzado tu límite de informes mensuales. Actualiza tu plan para continuar.' 
      };
    }

    return { canGenerate: true };
  }
};