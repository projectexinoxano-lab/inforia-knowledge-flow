// Ruta: src/pages/api/stripe/verify-session/[sessionId].ts (reemplazar contenido completo)
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID requerido' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return res.status(200).json({
      status: session.payment_status,
      amount: session.amount_total || 0,
      planId: session.metadata?.planId || '',
      customerId: typeof session.customer === 'string' ? session.customer : '',
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : '',
    });

  } catch (error: any) {
    console.error('Error verificando sesión:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}