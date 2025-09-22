// src/config/stripePrices.ts
/**
 * Configuración estática de los Price IDs de Stripe.
 * Estos valores son públicos (IDs de precios) y no representan un riesgo de seguridad al estar aquí.
 * Se consideran parte de la configuración de la aplicación más que de secretos.
 */
export const STRIPE_PRICE_IDS = {
  professional: 'price_1S6dUd0IBlKKRndHaOkSvMvZ', // <<< Reemplaza con tu ID real >>>
  clinic: 'price_1S6dVU0IBlKKRndHHvTozBcN',     // <<< Reemplaza con tu ID real >>>
} as const; // `as const` asegura tipos literales e inmutabilidad

// Opcional: Tipos derivados para mayor seguridad en tiempo de compilación
export type PlanId = keyof typeof STRIPE_PRICE_IDS;
export type PriceId = typeof STRIPE_PRICE_IDS[PlanId];