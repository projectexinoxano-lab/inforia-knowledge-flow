import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requireOnboarding = true,
  redirectTo = '/auth'
}: AuthGuardProps) {
  const { isAuthenticated, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Redirigir a auth si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Redirigir a onboarding si está autenticado pero no ha completado onboarding
    if (isAuthenticated && requireOnboarding && profile && !profile.onboarding_completed) {
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
      return;
    }

    // Redirigir a dashboard si está en auth pero ya está autenticado
    if (isAuthenticated && location.pathname.startsWith('/auth')) {
      const destination = profile?.onboarding_completed ? '/dashboard' : '/onboarding';
      navigate(destination, { replace: true });
    }
  }, [loading, isAuthenticated, profile, requireAuth, requireOnboarding, redirectTo, navigate, location]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inforia-cream">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth y no está autenticado, no renderizar nada (ya redirigido)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si requiere onboarding y no está completado, no renderizar nada (ya redirigido)
  if (isAuthenticated && requireOnboarding && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}