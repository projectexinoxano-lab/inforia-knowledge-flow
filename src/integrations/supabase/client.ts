// Ruta: src/integrations/supabase/client.ts
// COPIAR TODO DESDE AQUÍ
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dufziwaiyhozchsvuftl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Znppd2FpeWhvemNoc3Z1ZnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTM5NjksImV4cCI6MjA3MTE4OTk2OX0.waS0d0lbsXMItTiJMfOtdIoeI6NK_cHiMAwYM21jdfA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Debug helper
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('Supabase client inicializado correctamente');
}
// COPIAR HASTA AQUÍ