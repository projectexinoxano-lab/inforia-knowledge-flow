import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      console.error('[STRIPE] Variables de entorno disponibles:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      throw new Error(
        'STRIPE_SECRET_KEY no configurada. Verifica que:\n' +
        '1. La variable existe en .env.local\n' + 
        '2. dotenv se ejecutó antes de llamar a getStripeClient()\n' +
        '3. El nombre de la variable es exactamente STRIPE_SECRET_KEY'
      );
    }
    
    console.log('[STRIPE] Inicializando cliente con key que termina en:', secretKey.slice(-4));
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil', // CORREGIDO: Versión más reciente
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Función para resetear el cliente (útil para testing)
export function resetStripeClient(): void {
  stripeInstance = null;
}