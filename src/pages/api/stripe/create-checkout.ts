// Ruta: src/pages/api/stripe/create-checkout.ts (reemplazar contenido completo)
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId, email } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const priceId = planId === 'professional' 
      ? process.env.STRIPE_PROFESSIONAL_PRICE_ID 
      : process.env.STRIPE_CLINIC_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ error: 'Price ID no configurado' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      customer_email: email,
      metadata: {
        userId,
        planId,
      },
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Error creando checkout:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}