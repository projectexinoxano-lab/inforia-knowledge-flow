// src/pages/api/stripe/change-plan.ts
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export const changePlan = async (req: express.Request, res: express.Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- CORRECTO para change-plan: Esperar subscriptionId y newPlanId ---
    const { subscriptionId, newPlanId } = req.body;
    // -------------------------------------------------------------------

    if (!subscriptionId || !newPlanId) {
      // --- Mensaje de error específico y correcto ---
      return res.status(400).json({ error: 'Faltan subscriptionId o newPlanId' });
      // ---------------------------------------------
    }

    // Determinar el nuevo Price ID de Stripe
    let newPriceId;
    if (newPlanId === 'professional') {
      newPriceId = process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID;
    } else if (newPlanId === 'clinic') {
      newPriceId = process.env.VITE_STRIPE_CLINIC_PRICE_ID;
    } else {
      return res.status(400).json({ error: 'Nuevo Plan ID no válido' });
    }

    if (!newPriceId) {
      console.error(`Nuevo Price ID no configurado para el plan: ${newPlanId}`);
      return res.status(500).json({ error: `Nuevo Price ID no configurado para el plan ${newPlanId}` });
    }

    // --- CORRECTO para change-plan: Actualizar la suscripción existente ---
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        price: newPriceId,
      }],
      // proration_behavior: 'create_prorated_invoice' es la opción por defecto y válida
    });
    // ---------------------------------------------------------------------

    return res.status(200).json({
      message: 'Plan actualizado exitosamente',
      subscription: updatedSubscription
    });

  } catch (error: any) {
    console.error('Error cambiando plan en el backend del SaaS:', error);
    // Devolver un mensaje de error más genérico pero amigable
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
       return res.status(400).json({ error: 'La suscripción no fue encontrada.' });
    }
    return res.status(500).json({
      error: error.message || 'Error interno del servidor al cambiar el plan',
    });
  }
};