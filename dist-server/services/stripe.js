// Configuración de planes según documentación INFORIA
const SUBSCRIPTION_PLANS = {
    professional: {
        id: 'professional',
        name: 'Plan Profesional',
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
        stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRODUCT_ID || '',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || ''
    },
    clinic: {
        id: 'clinic',
        name: 'Plan Clínica',
        price: 149,
        reports: 150,
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
        stripeProductId: process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRODUCT_ID || '',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID || ''
    }
};
class StripeServiceImplementation {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }
    async apiRequest(endpoint, options = {}) {
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
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        }
        catch (error) {
            console.error(`Stripe API Error [${endpoint}]:`, error);
            throw error;
        }
    }
    // Crear sesión de checkout para nueva suscripción
    async createCheckoutSession(planId, userId, email) {
        if (!SUBSCRIPTION_PLANS[planId]) {
            throw new Error(`Plan inválido: ${planId}`);
        }
        return this.apiRequest('/create-checkout', {
            method: 'POST',
            body: JSON.stringify({ planId, userId, email }),
        });
    }
    // Cambiar plan de suscripción
    async changePlan(subscriptionId, newPlanId) {
        if (!SUBSCRIPTION_PLANS[newPlanId]) {
            throw new Error(`Plan inválido: ${newPlanId}`);
        }
        try {
            await this.apiRequest('/change-plan', {
                method: 'POST',
                body: JSON.stringify({ subscriptionId, newPlanId }),
            });
            return true;
        }
        catch (error) {
            console.error('Error cambiando plan:', error);
            return false;
        }
    }
    // Renovación anticipada - funcionalidad clave de INFORIA
    async renewEarly(subscriptionId) {
        try {
            return await this.apiRequest('/renew-early', {
                method: 'POST',
                body: JSON.stringify({ subscriptionId }),
            });
        }
        catch (error) {
            return {
                success: false,
                newPeriodEnd: '',
                error: error instanceof Error ? error.message : 'Error en renovación anticipada'
            };
        }
    }
    // Verificar si puede renovar anticipadamente
    canRenewEarly(subscription) {
        const plan = SUBSCRIPTION_PLANS[subscription.planId];
        if (!plan)
            return false;
        // Puede renovar si ha usado más del 80% de sus informes
        const usagePercentage = (subscription.reportsUsed / subscription.reportsLimit) * 100;
        return usagePercentage >= 80;
    }
    // Obtener facturas del usuario
    async getInvoices(userId, limit = 12) {
        try {
            return await this.apiRequest(`/invoices?userId=${userId}&limit=${limit}`);
        }
        catch (error) {
            console.error('Error obteniendo facturas:', error);
            return [];
        }
    }
    // Descargar factura específica
    async downloadInvoice(invoiceId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/stripe/download-invoice/${invoiceId}`);
            if (!response.ok) {
                throw new Error('Error descargando factura');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            // Crear enlace temporal para descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `factura-${invoiceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Limpiar URL
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            return url;
        }
        catch (error) {
            console.error('Error descargando factura:', error);
            throw error;
        }
    }
    // Cancelar suscripción
    async cancelSubscription(subscriptionId, immediately = false) {
        try {
            await this.apiRequest('/cancel', {
                method: 'POST',
                body: JSON.stringify({ subscriptionId, immediately }),
            });
            return true;
        }
        catch (error) {
            console.error('Error cancelando suscripción:', error);
            return false;
        }
    }
    // Crear sesión del portal del cliente
    async createCustomerPortalSession(customerId) {
        return this.apiRequest('/customer-portal', {
            method: 'POST',
            body: JSON.stringify({ customerId }),
        });
    }
    // Obtener todos los planes disponibles
    getPlans() {
        return Object.values(SUBSCRIPTION_PLANS);
    }
    // Obtener plan específico
    getPlan(planId) {
        return SUBSCRIPTION_PLANS[planId];
    }
    // Formatear precio para mostrar
    formatPrice(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    // Manejar webhooks de Stripe
    async handleWebhook(event) {
        try {
            await this.apiRequest('/webhook', {
                method: 'POST',
                body: JSON.stringify(event),
            });
        }
        catch (error) {
            console.error('Error procesando webhook:', error);
            throw error;
        }
    }
}
// Instancia singleton del servicio
export const stripeService = new StripeServiceImplementation();
// Exportar tipos y constantes útiles
export { SUBSCRIPTION_PLANS };
// Hook personalizado para React
export const useStripe = () => {
    return {
        service: stripeService,
        plans: SUBSCRIPTION_PLANS,
        formatPrice: stripeService.formatPrice,
    };
};
// Utilidades adicionales
export const StripeUtils = {
    // Calcular próxima fecha de facturación
    getNextBillingDate(currentPeriodEnd) {
        return new Date(currentPeriodEnd).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    },
    // Verificar si suscripción está activa
    isSubscriptionActive(status) {
        return ['active', 'trialing'].includes(status);
    },
    // Obtener color para estado de suscripción
    getStatusColor(status) {
        switch (status) {
            case 'active':
            case 'trialing':
                return 'text-green-600 bg-green-50';
            case 'past_due':
            case 'incomplete':
                return 'text-yellow-600 bg-yellow-50';
            case 'canceled':
            case 'incomplete_expired':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    },
    // Traducciones de estados
    translateStatus(status) {
        const translations = {
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
    // Validar plan ID
    isValidPlan(planId) {
        return planId === 'professional' || planId === 'clinic';
    },
};
