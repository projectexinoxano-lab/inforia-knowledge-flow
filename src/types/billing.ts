// Ruta: src/types/billing.ts
export interface SubscriptionPlan {
  id: 'professional' | 'clinic';
  name: string;
  price: number;
  reports: number;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  recommended?: boolean;
  description: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: 'professional' | 'clinic';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  reportsUsed: number;
  reportsLimit: number;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'draft' | 'open' | 'void';
  plan: string;
  downloadUrl?: string;
  stripeInvoiceId: string;
  subscriptionId: string;
  userId: string;
  description?: string;
  dueDate?: string;
  paidAt?: string;
}

export interface EarlyRenewalResponse {
  success: boolean;
  newPeriodEnd: string;
  invoiceUrl?: string;
  error?: string;
  subscriptionId?: string;
  amountPaid?: number;
}

export interface BillingProfile {
  userId: string;
  stripeCustomerId?: string;
  currentPlan: 'professional' | 'clinic';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete';
  reportsUsed: number;
  reportsLimit: number;
  nextBillingDate: string;
  billingEmail?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface CheckoutSessionRequest {
  planId: 'professional' | 'clinic';
  userId: string;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

export interface PlanChangeRequest {
  subscriptionId: string;
  newPlanId: 'professional' | 'clinic';
  prorationBehavior?: 'always_invoice' | 'create_prorations' | 'none';
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  immediately?: boolean;
  cancellationReason?: string;
}

export interface CustomerPortalRequest {
  customerId: string;
  returnUrl?: string;
}

export interface UsageStats {
  reportsGenerated: number;
  reportsRemaining: number;
  usagePercentage: number;
  canRenewEarly: boolean;
  daysUntilRenewal: number;
}

// Tipos para componentes UI
export interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelect?: (planId: 'professional' | 'clinic') => void;
  loading?: boolean;
  highlighted?: boolean;
}

export interface BillingSectionProps {
  subscription: Subscription;
  invoices: Invoice[];
  usageStats: UsageStats;
  onDownloadInvoice: (invoiceId: string) => void;
  onEarlyRenewal?: () => void;
  onCancelSubscription?: () => void;
  onManageBilling?: () => void;
}

// CORREGIDO: Usar import.meta.env en lugar de process.env
export const INFORIA_PLANS: Record<string, SubscriptionPlan> = {
  professional: {
    id: 'professional',
    name: 'Plan Profesional',
    description: 'Perfecto para psicólogos autónomos',
    price: 99,
    reports: 100,
    features: [
      '100 informes mensuales',
      'Transcripción automática de sesiones',
      'Generación de informes con IA',
      'Integración con Google Workspace',
      'Soporte estándar por email',
      'Almacenamiento seguro Zero-Knowledge'
    ],
    stripeProductId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRODUCT_ID || '',
    stripePriceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID || ''
  },
  clinic: {
    id: 'clinic',
    name: 'Plan Clínica',
    description: 'Ideal para clínicas y centros de psicología',
    price: 149,
    reports: 150,
    recommended: true,
    features: [
      '150 informes mensuales',
      'Transcripción automática de sesiones',
      'Generación de informes con IA',
      'Integración con Google Workspace',
      'Soporte prioritario',
      'Almacenamiento seguro Zero-Knowledge',
      'Gestión multi-profesional',
      'Dashboards analíticos avanzados'
    ],
    stripeProductId: import.meta.env.VITE_STRIPE_CLINIC_PRODUCT_ID || '',
    stripePriceId: import.meta.env.VITE_STRIPE_CLINIC_PRICE_ID || ''
  }
};

// Tipos para errores
export interface StripeError {
  message: string;
  code?: string;
  type?: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  param?: string;
  decline_code?: string;
}

// Tipos para webhooks específicos
export interface SubscriptionCreatedEvent {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  metadata: Record<string, string>;
}

export interface InvoicePaymentSucceededEvent {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: number;
  status: string;
  hosted_invoice_url: string;
}

// Utilidades de tipo
export type PlanId = 'professional' | 'clinic';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'draft' | 'open' | 'void';

// Validadores de tipo
export const isValidPlanId = (planId: string): planId is PlanId => {
  return planId === 'professional' || planId === 'clinic';
};

export const isActiveSubscription = (status: SubscriptionStatus): boolean => {
  return ['active', 'trialing'].includes(status);
};

export const canRenewEarly = (reportsUsed: number, reportsLimit: number): boolean => {
  return (reportsUsed / reportsLimit) >= 0.8; // 80% o más usado
};

export const formatPrice = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};