// Ruta: src/services/stripe.ts
import {
  Invoice,
  Subscription,
  EarlyRenewalResponse,
  SubscriptionPlan,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  PlanChangeRequest,
  CancelSubscriptionRequest,
  CustomerPortalRequest,
  BillingProfile,
  UsageStats,
  INFORIA_PLANS,
  isValidPlanId,
  isActiveSubscription,
  canRenewEarly,
  formatPrice,
  formatDate
} from '@/types/billing';

interface StripeService {
  // Gestión de suscripciones
  createCheckoutSession(planId: 'professional' | 'clinic', userId: string, email?: string): Promise<CheckoutSessionResponse>;
  changePlan(request: PlanChangeRequest): Promise<boolean>;
  cancelSubscription(request: CancelSubscriptionRequest): Promise<boolean>;
  
  // Renovación anticipada (funcionalidad clave de INFORIA)
  renewEarly(subscriptionId: string): Promise<EarlyRenewalResponse>;
  canUserRenewEarly(subscription: Subscription): boolean;
  
  // Gestión de facturas
  getInvoices(userId: string, limit?: number): Promise<Invoice[]>;
  downloadInvoice(invoiceId: string): Promise<string>;
  
  // Portal del cliente
  createCustomerPortalSession(request: CustomerPortalRequest): Promise<{ url: string }>;
  
  // Información de usuario
  getBillingProfile(userId: string): Promise<BillingProfile | null>;
  getUsageStats(userId: string): Promise<UsageStats>;
  
  // Utilidades
  getPlans(): SubscriptionPlan[];
  getPlan(planId: string): SubscriptionPlan | undefined;
  formatPrice(amount: number): string;
  
  // Verificación de sesiones
  verifyCheckoutSession(sessionId: string): Promise<any>;
  
  // Webhook handling
  handleWebhook(event: any): Promise<void>;
}

class StripeServiceImplementation implements StripeService {
  private baseUrl: string;

  constructor() {
    // CORREGIDO: Usar window.location.origin en lugar de process.env
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:8080'; // Puerto por defecto de Vite
  }

  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/stripe${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.message || errorData.error || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error(`Stripe API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Crear sesión de checkout para nueva suscripción
  async createCheckoutSession(
    planId: 'professional' | 'clinic', 
    userId: string, 
    email?: string
  ): Promise<CheckoutSessionResponse> {
    if (!isValidPlanId(planId)) {
      throw new Error(`Plan inválido: ${planId}`);
    }

    if (!INFORIA_PLANS[planId]) {
      throw new Error(`Configuración de plan no encontrada: ${planId}`);
    }

    const request: CheckoutSessionRequest = {
      planId,
      userId,
      email,
      successUrl: `${this.baseUrl}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${this.baseUrl}/account?canceled=true`
    };

    return this.apiRequest<CheckoutSessionResponse>('/create-checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Cambiar plan de suscripción
  async changePlan(request: PlanChangeRequest): Promise<boolean> {
    if (!isValidPlanId(request.newPlanId)) {
      throw new Error(`Plan inválido: ${request.newPlanId}`);
    }

    try {
      await this.apiRequest('/change-plan', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return true;
    } catch (error) {
      console.error('Error cambiando plan:', error);
      return false;
    }
  }

  // Renovación anticipada - funcionalidad clave de INFORIA
  async renewEarly(subscriptionId: string): Promise<EarlyRenewalResponse> {
    if (!subscriptionId) {
      throw new Error('Subscription ID es requerido');
    }

    try {
      return await this.apiRequest<EarlyRenewalResponse>('/renew-early', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId }),
      });
    } catch (error) {
      console.error('Error en renovación anticipada:', error);
      return {
        success: false,
        newPeriodEnd: '',
        error: error instanceof Error ? error.message : 'Error en renovación anticipada'
      };
    }
  }

  // Verificar si puede renovar anticipadamente
  canUserRenewEarly(subscription: Subscription): boolean {
    if (!isActiveSubscription(subscription.status)) {
      return false;
    }

    return canRenewEarly(subscription.reportsUsed, subscription.reportsLimit);
  }

  // Obtener facturas del usuario
  async getInvoices(userId: string, limit: number = 12): Promise<Invoice[]> {
    if (!userId) {
      throw new Error('User ID es requerido');
    }

    try {
      return await this.apiRequest<Invoice[]>(`/invoices?userId=${encodeURIComponent(userId)}&limit=${limit}`);
    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      return [];
    }
  }

  // Descargar factura específica
  async downloadInvoice(invoiceId: string): Promise<string> {
    if (!invoiceId) {
      throw new Error('Invoice ID es requerido');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/download-invoice/${invoiceId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Error descargando factura: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `inforia-factura-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      return url;
    } catch (error) {
      console.error('Error descargando factura:', error);
      throw error;
    }
  }

  // Cancelar suscripción
  async cancelSubscription(request: CancelSubscriptionRequest): Promise<boolean> {
    if (!request.subscriptionId) {
      throw new Error('Subscription ID es requerido');
    }

    try {
      await this.apiRequest('/cancel', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return true;
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return false;
    }
  }

  // Crear sesión del portal del cliente
  async createCustomerPortalSession(request: CustomerPortalRequest): Promise<{ url: string }> {
    if (!request.customerId) {
      throw new Error('Customer ID es requerido');
    }

    return this.apiRequest<{ url: string }>('/customer-portal', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Obtener perfil de facturación del usuario
  async getBillingProfile(userId: string): Promise<BillingProfile | null> {
    if (!userId) {
      throw new Error('User ID es requerido');
    }

    try {
      return await this.apiRequest<BillingProfile>(`/billing-profile?userId=${encodeURIComponent(userId)}`);
    } catch (error) {
      console.error('Error obteniendo perfil de facturación:', error);
      return null;
    }
  }

  // Obtener estadísticas de uso
  async getUsageStats(userId: string): Promise<UsageStats> {
    if (!userId) {
      throw new Error('User ID es requerido');
    }

    try {
      return await this.apiRequest<UsageStats>(`/usage-stats?userId=${encodeURIComponent(userId)}`);
    } catch (error) {
      console.error('Error obteniendo estadísticas de uso:', error);
      // Retornar valores por defecto en caso de error
      return {
        reportsGenerated: 0,
        reportsRemaining: 100,
        usagePercentage: 0,
        canRenewEarly: false,
        daysUntilRenewal: 30
      };
    }
  }

  // Verificar sesión de checkout
  async verifyCheckoutSession(sessionId: string): Promise<any> {
    if (!sessionId) {
      throw new Error('Session ID es requerido');
    }

    return this.apiRequest(`/verify-session/${sessionId}`, {
      method: 'GET',
    });
  }

  // Obtener todos los planes disponibles
  getPlans(): SubscriptionPlan[] {
    return Object.values(INFORIA_PLANS);
  }

  // Obtener plan específico
  getPlan(planId: string): SubscriptionPlan | undefined {
    return INFORIA_PLANS[planId];
  }

  // Formatear precio para mostrar
  formatPrice(amount: number): string {
    return formatPrice(amount, 'EUR');
  }

  // Manejar webhooks de Stripe
  async handleWebhook(event: any): Promise<void> {
    try {
      await this.apiRequest('/webhook', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const stripeService = new StripeServiceImplementation();

// Exportar tipos y constantes útiles
export { INFORIA_PLANS };
export type { StripeService };

// Hook personalizado para React
export const useStripe = () => {
  return {
    service: stripeService,
    plans: INFORIA_PLANS,
    formatPrice: (amount: number) => formatPrice(amount, 'EUR'),
    isValidPlan: isValidPlanId,
    canRenewEarly: canRenewEarly,
  };
};

// Utilidades adicionales específicas de INFORIA
export const InforiaStripeUtils = {
  // Calcular próxima fecha de facturación
  getNextBillingDate(currentPeriodEnd: string): string {
    return formatDate(currentPeriodEnd);
  },

  // Verificar si suscripción está activa
  isSubscriptionActive: isActiveSubscription,

  // Obtener color para estado de suscripción (para UI)
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'past_due':
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'canceled':
      case 'incomplete_expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  // Traducciones de estados para UI
  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'active': 'Activa',
      'trialing': 'Período de prueba',
      'past_due': 'Pago pendiente',
      'canceled': 'Cancelada',
      'incomplete': 'Incompleta',
      'incomplete_expired': 'Expirada',
      'unpaid': 'No pagada',
    };
    return translations[status] || status;
  },

  // Calcular días restantes hasta renovación
  getDaysUntilRenewal(currentPeriodEnd: string): number {
    const endDate = new Date(currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Obtener descripción del plan
  getPlanDescription(planId: string): string {
    const plan = INFORIA_PLANS[planId];
    return plan ? `${plan.name} - ${plan.reports} informes/mes` : 'Plan desconocido';
  },
};

// CORREGIDO: Configuración de desarrollo/testing
if (import.meta.env.MODE === 'development') {
  // Exponer servicio en window para debugging
  if (typeof window !== 'undefined') {
    (window as any).inforiaStripe = stripeService;
    (window as any).InforiaStripeUtils = InforiaStripeUtils;
  }
}