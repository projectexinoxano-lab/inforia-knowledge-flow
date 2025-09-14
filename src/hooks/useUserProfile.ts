// Ruta: src/hooks/useUserProfile.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  plan_type: string;
  credits_used: number;
  credits_limit: number;
  subscription_status: string;
  professional_license?: string;
  clinic_name?: string;
  phone?: string;
  onboarding_completed: boolean;
  
  // ✅ CAMPOS DE FACTURACIÓN AÑADIDOS
  billing_name?: string;
  billing_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_country?: string;
  nif_dni?: string;
  
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<UserProfile | null> => {
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
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };

  return { ...query, refreshProfile };
}