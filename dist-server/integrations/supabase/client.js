// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://dufziwaiyhozchsvuftl.supabase.co"; // Corregido: sin espacios
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Znppd2FpeWhvemNoc3Z1ZnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTM5NjksImV4cCI6MjA3MTE4OTk2OX0.waS0d0lbsXMItTiJMfOtdIoeI6NK_cHiMAwYM21jdfA";
// --- Detectar entorno ---
const isBrowser = typeof window !== 'undefined';
// --- Configurar opciones de auth basadas en el entorno ---
const authOptions = {
    // Solo usar localStorage si estamos en el navegador
    storage: isBrowser ? localStorage : undefined,
    persistSession: isBrowser, // Solo persistir en el navegador
    autoRefreshToken: isBrowser, // Solo refrescar en el navegador
    detectSessionInUrl: isBrowser // Solo detectar en el navegador
};
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: authOptions
});
// Debug helper (solo en navegador)
if (isBrowser) {
    window.supabase = supabase;
    console.log('Supabase client inicializado correctamente');
}
