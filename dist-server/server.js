// CRÍTICO: Cargar variables de entorno ANTES de cualquier import
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('[SERVER] Variables STRIPE cargadas:', Object.keys(process.env)
    .filter(k => k.includes('STRIPE'))
    .map(k => `${k}=${k.includes('SECRET') ? '***' : process.env[k]}`));
// Importar módulos con rutas corregidas para archivo en raíz
import express from 'express';
import cors from 'cors';
import { createCheckoutSession } from './src/pages/api/stripe/create-checkout.js';
import { verifySession } from './src/pages/api/stripe/verify-session.js';
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors({
    origin: process.env.VITE_BASE_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            hasPriceIds: Object.keys(process.env).filter(k => k.includes('PRICE_ID')).length
        }
    });
});
// Rutas de Stripe
app.post('/api/stripe/create-checkout', createCheckoutSession);
app.get('/api/stripe/verify-session/:sessionId', verifySession);
// Manejo de errores
app.use((err, req, res, next) => {
    console.error('[SERVER] Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[SERVER] Ejecutándose en puerto ${PORT}`);
    console.log(`[SERVER] CORS habilitado para: ${process.env.VITE_BASE_URL || 'http://localhost:5173'}`);
    console.log('[SERVER] Endpoints disponibles:');
    console.log('  - GET  /api/health');
    console.log('  - POST /api/stripe/create-checkout');
    console.log('  - GET  /api/stripe/verify-session/:sessionId');
});
export default app;
