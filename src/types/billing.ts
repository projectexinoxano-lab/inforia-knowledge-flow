// Ruta: src/types/billing.ts
export interface SubscriptionPlan {
  id: 'professional' | 'clinic';
  name: string;
  price: number;
  reports: number;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
  stripeInvoiceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: 'professional' | 'clinic';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string;
  reportsUsed: number;
  reportsLimit: number;
}

export interface EarlyRenewalResponse {
  success: boolean;
  newPeriodEnd: string;
  invoiceUrl?: string;
  error?: string;
}