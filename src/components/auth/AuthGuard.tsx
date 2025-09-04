// Ruta: src/components/auth/AuthGuard.tsx
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
    // SOLO actuar cuando loading sea false Y tengamos datos definitivos
    if (loading) return;

    console.log('[AUTHGUARD]', {
      path: location.pathname,
      isAuthenticated,
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed,
      requireAuth,
      requireOnboarding
    });

    // 1. Si requiere auth y NO está autenticado → redirigir a login
    if (requireAuth && !isAuthenticated) {
      console.log('[AUTHGUARD] Not authenticated, redirecting to auth');
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // 2. Si está en /auth pero YA está autenticado → redirigir fuera
    if (isAuthenticated && location.pathname === '/auth') {
      console.log('[AUTHGUARD] Already authenticated, redirecting from auth');
      navigate('/', { replace: true });
      return;
    }

    // 3. Si requiere onboarding, está autenticado, tiene profile y NO completó onboarding
    if (isAuthenticated && requireOnboarding && profile && profile.onboarding_completed === false) {
      if (location.pathname !== '/onboarding') {
        console.log('[AUTHGUARD] Onboarding required, redirecting');
        navigate('/onboarding', { replace: true });
      }
      return;
    }

  }, [loading, isAuthenticated, profile?.onboarding_completed, requireAuth, requireOnboarding, location.pathname, navigate, redirectTo]);

  // Mostrar loading solo mientras AUTH está cargando (no esperando profile)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth y no está autenticado, mostrar nada (ya redirigiendo)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si requiere onboarding, está autenticado, tiene profile y no completó onboarding
  if (isAuthenticated && requireOnboarding && profile && profile.onboarding_completed === false && location.pathname !== '/onboarding') {
    return null;
  }

  // IMPORTANTE: Si está autenticado pero profile aún no carga, PERMITIR acceso
  // No bloquear navegación por profile pendiente
  return <>{children}</>;
}