// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Interfaz UserProfile corregida: Propiedades que pueden venir como null de Supabase
export interface UserProfile {
  id: string;
  full_name: string | null; // Puede ser null
  avatar_url: string | null; // Puede ser null
  professional_license: string | null; // Puede ser null
  clinic_name: string | null; // Puede ser null
  phone: string | null; // Puede ser null
  email: string | null; // Puede ser null
  physical_address: string | null; // Puede ser null
  tax_id: string | null; // Puede ser null
  billing_name: string | null; // Puede ser null
  billing_email: string | null; // Puede ser null
  billing_address: string | null; // Puede ser null
  billing_city: string | null; // Puede ser null
  billing_postal_code: string | null; // Puede ser null
  billing_country: string | null; // Puede ser null
  nif_dni: string | null; // Puede ser null
  collegiate_number: string | null; // Puede ser null
  specialties: string | null; // Puede ser null
  plan_type: string | null; // <-- Corrección clave: puede ser null
  credits_used: number | null; // Puede ser null
  credits_limit: number | null; // Puede ser null
  subscription_status: string | null; // Puede ser null
  onboarding_completed: boolean | null; // Puede ser null
  created_at: string | null; // Puede ser null
  updated_at: string | null; // Puede ser null
  subscription_id: string | null; // Puede ser null
  customer_id: string | null; // Puede ser null
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      // Asegurar que `data` tenga un tipo compatible con UserProfile
      // Si `data` es null, `setProfile` lo acepta.
      // Si `data` es un objeto, sus propiedades deben coincidir con UserProfile.
      setProfile(data); // Ahora debería funcionar sin errores de tipado
      console.log('[AUTH] Profile loaded:', !!data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing authentication...');

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AUTH] State changed:', event, !!session);
            
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              loadUserProfile(session.user.id);
            } else {
              setProfile(null);
            }
          }
        );

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Session error:', error);
        }

        if (!mounted) return;

        console.log('[AUTH] Initial session:', !!initialSession);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
        
        if (initialSession?.user) {
          loadUserProfile(initialSession.user.id);
        }

        console.log('[AUTH] Auth initialization complete');

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('[AUTH] Initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: 'openid email profile https://www.googleapis.com/auth/drive.file'
        }
      });
      if (error) {
        toast.error('Error al iniciar sesión con Google');
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error al cerrar sesión');
        throw error;
      }
      setProfile(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Error al actualizar perfil');
        throw error;
      }

      await loadUserProfile(user.id);
      toast.success('Perfil actualizado');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isAuthenticated,
      signInWithGoogle,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};