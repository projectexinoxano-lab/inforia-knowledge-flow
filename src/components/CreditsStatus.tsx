import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function CreditsStatus() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: creditsService.getUserProfile,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  if (isLoading || !profile) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse h-4 bg-secondary rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = (profile.credits_used / profile.credits_limit) * 100;
  const remainingCredits = profile.credits_limit - profile.credits_used;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'over_quota': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'warning': return 'Límite Próximo';
      case 'over_quota': return 'Límite Alcanzado';
      default: return 'Estado Desconocido';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Estado de Suscripción</CardTitle>
          <Badge variant="outline" className={getStatusColor(profile.subscription_status)}>
            {getStatusText(profile.subscription_status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Plan {profile.plan_type === 'professional' ? 'Profesional' : 'Clínica'}</span>
            <span>{remainingCredits} informes restantes</span>
          </div>
          
          <Progress value={usagePercentage} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{profile.credits_used} de {profile.credits_limit} utilizados</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          
          {profile.subscription_status === 'warning' && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ Te quedan pocos informes. Considera actualizar tu plan.
            </div>
          )}
          
          {profile.subscription_status === 'over_quota' && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              🚫 Has alcanzado tu límite. Actualiza tu plan para continuar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}