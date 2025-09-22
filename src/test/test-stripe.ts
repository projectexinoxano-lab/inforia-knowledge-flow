import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('=== TEST DE CONFIGURACIÓN STRIPE ===\n');

// 1. Verificar STRIPE_SECRET_KEY
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY no encontrada');
  console.log('   Asegúrate de que .env.local contenga: STRIPE_SECRET_KEY=sk_test_...\n');
} else if (!secretKey.startsWith('sk_')) {
  console.error('❌ STRIPE_SECRET_KEY inválida (debe empezar con sk_)');
} else {
  console.log('✅ STRIPE_SECRET_KEY configurada correctamente');
  console.log(`   Prefijo: ${secretKey.substring(0, 7)}...${secretKey.slice(-4)}\n`);
}

// 2. Verificar Price IDs
const priceIds = [
  'VITE_STRIPE_PROFESSIONAL_PRICE_ID',
  'VITE_STRIPE_ENTERPRISE_PRICE_ID'
];

console.log('Price IDs:');
priceIds.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ ${key} no encontrada`);
  } else if (!value.startsWith('price_')) {
    console.error(`❌ ${key} inválida (debe empezar con price_)`);
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
  }
});

// 3. Probar inicialización del cliente
if (secretKey) {
  try {
    const { getStripeClient } = await import('./lib/stripe-client.js');
    const stripe = getStripeClient();
    console.log('\n✅ Cliente Stripe inicializado correctamente');
    
    // Intentar hacer una llamada simple a la API
    const prices = await stripe.prices.list({ limit: 1 });
    console.log(`✅ Conexión con API de Stripe exitosa (${prices.data.length} price(s) encontrado(s))`);
  } catch (error) {
    console.error('\n❌ Error al inicializar Stripe:', error);
  }
}

console.log('\n=== FIN DEL TEST ===');