// src/pages/api/stripe/cancel-subscription.ts
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export const cancelSubscription = async (req: express.Request, res: express.Response) => {
  // ... (validación de método y subscriptionId igual)

  try {
    const { subscriptionId, immediately = false } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Falta el subscriptionId' });
    }

    let canceledSubscription;
    if (immediately) {
      // --- CORRECCIÓN ---
      // En lugar de stripe.subscriptions.del(subscriptionId);
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      // ---
    } else {
      // Cancelar al final del período actual
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const message = immediately 
      ? 'Suscripción cancelada inmediatamente.'
      : 'Suscripción marcada para cancelación al final del período actual.';

    return res.status(200).json({
      message,
      subscription: canceledSubscription
    });

  } catch (error: any) {
    // ... (manejo de errores igual)
  }
};