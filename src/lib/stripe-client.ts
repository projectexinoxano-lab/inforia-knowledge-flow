// src/lib/stripe-client.ts
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Carga de forma síncrona un fichero .env (por ejemplo .env.local) y añade
 * las variables a process.env **solo si no existen ya**.
 * Esto permite un fallback cuando dotenv no se ha ejecutado antes.
 */
function loadEnvFileSync(fileName = '.env.local'): void {
  try {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // eliminar comillas envolventes si existen
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (err) {
    // No interrumpimos la ejecución; solo avisamos
    // eslint-disable-next-line no-console
    console.warn('[STRIPE] No se pudo leer el fichero de entorno:', err);
  }
}

/**
 * Devuelve una instancia singleton de Stripe.
 * - Intenta leer STRIPE_SECRET_KEY de process.env
 * - Si no está, intenta cargar .env.local (fallback síncrono)
 * - Si sigue sin estar, lanza error con información de depuración
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    // Primer intento: variables ya cargadas en process.env
    let secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;

    // Fallback: intentar cargar .env.local manualmente (si el proyecto no cargó dotenv)
    if (!secretKey) {
      loadEnvFileSync('.env.local');
      secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;
    }

    if (!secretKey) {
      const available = Object.keys(process.env).filter((k) => k.includes('STRIPE'));
      // eslint-disable-next-line no-console
      console.error('[STRIPE] Variables de entorno relacionadas encontradas:', available);
      throw new Error(
        'STRIPE_SECRET_KEY no configurada. Verifica que:\n' +
        '1. La variable exista en .env.local o .env\n' +
        '2. El servidor carga las variables de entorno (dotenv) antes de usar Stripe\n' +
        '3. El nombre de la variable sea exactamente STRIPE_SECRET_KEY'
      );
    }

    // eslint-disable-next-line no-console
    console.log('[STRIPE] Inicializando cliente con key que termina en:', secretKey.slice(-4));

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil', // puedes ajustar la versión aquí si prefieres otra
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Reset para tests o re-inicialización manual.
 */
export function resetStripeClient(): void {
  stripeInstance = null;
}
