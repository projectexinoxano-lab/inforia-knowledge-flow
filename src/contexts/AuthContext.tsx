// Ruta: src/contexts/AuthContext.tsx (mejorar distinción loading)
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  professional_license?: string;
  clinic_name?: string;
  phone?: string;
  plan_type: string;
  credits_used: number;
  credits_limit: number;
  subscription_status: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
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
  const [loading, setLoading] = useState(true); // Solo para AUTH, no para profile

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

      setProfile(data);
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

        // 1. Configurar listener de cambios de auth PRIMERO
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AUTH] State changed:', event, !!session);
            
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);
            
            // Cargar profile en background, sin bloquear auth
            if (session?.user) {
              loadUserProfile(session.user.id); // No await aquí
            } else {
              setProfile(null);
            }
          }
        );

        // 2. Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Session error:', error);
        }

        if (!mounted) return;

        console.log('[AUTH] Initial session:', !!session);
        
        // 3. Establecer estado AUTH (sin esperar profile)
        setSession(session);
        setUser(session?.user ?? null);
        
        // 4. FINALIZAR loading de AUTH inmediatamente
        setLoading(false);
        
        // 5. Cargar profile en background
        if (session?.user) {
          loadUserProfile(session.user.id);
        }

        console.log('[AUTH] Auth initialization complete');

        // Cleanup
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
      loading, // Solo loading de AUTH, no de profile
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