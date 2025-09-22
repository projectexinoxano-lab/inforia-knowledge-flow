import { Request, Response } from 'express';
// Importación corregida para servidor en raíz
import { getStripeClient } from '../../../lib/stripe-clients.js';

const stripePriceIds: Record<string, string | undefined> = {
  professional: process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
  enterprise: process.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
};

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
  console.log('[CHECKOUT] Iniciando creación de sesión');
  console.log('[CHECKOUT] Body recibido:', req.body);
  
  try {
    const { planId } = req.body;
    
    if (!planId || typeof planId !== 'string') {
      res.status(400).json({ 
        error: 'planId es requerido y debe ser string',
        received: planId 
      });
      return;
    }
    
    // Obtener priceId dinámicamente para asegurar que las variables estén cargadas
    const priceId = process.env[`VITE_STRIPE_${planId.toUpperCase()}_PRICE_ID`];
    
    if (!priceId) {
      console.error('[CHECKOUT] Price IDs disponibles:', Object.keys(process.env).filter(k => k.includes('PRICE_ID')));
      res.status(400).json({ 
        error: `Plan "${planId}" no válido o price_id no configurado`,
        availablePlans: Object.keys(stripePriceIds).filter(k => stripePriceIds[k])
      });
      return;
    }
    
    console.log('[CHECKOUT] Usando price_id:', priceId);
    
    // Inicializar Stripe usando el factory (lazy initialization)
    const stripe = getStripeClient();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_BASE_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_BASE_URL || 'http://localhost:5173'}/pricing`,
      // NO incluimos customer_email para que Stripe lo solicite
      metadata: {
        planId: planId,
      }
    });
    
    console.log('[CHECKOUT] Sesión creada:', session.id);
    
    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error) {
    console.error('[CHECKOUT] Error completo:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const statusCode = errorMessage.includes('STRIPE_SECRET_KEY') ? 500 : 400;
    
    res.status(statusCode).json({
      error: 'Error al crear sesión de checkout',
      details: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}