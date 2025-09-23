import { Request, Response } from 'express';
import { getStripeClient } from '../../../lib/stripe-clients.ts';

export async function verifySession(req: Request, res: Response): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'Session ID requerido' });
    return;
  }

  try {
    console.log('[VERIFY-SESSION] Verificando sesión:', sessionId);
    
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('[VERIFY-SESSION] Sesión encontrada:', {
      id: session.id,
      status: session.payment_status,
      planId: session.metadata?.planId
    });
    
    res.status(200).json({
      status: session.payment_status,
      amount: session.amount_total || 0,
      planId: session.metadata?.planId || '',
      customerId: typeof session.customer === 'string' ? session.customer : '',
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : '',
    });

  } catch (error: any) {
    console.error('[VERIFY-SESSION] Error verificando sesión:', error);
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}