-- Ruta: supabase/migrations/add_billing_name.sql
-- Añadir campo billing_name a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_name TEXT;

-- Índice para búsquedas de nombres de facturación
CREATE INDEX IF NOT EXISTS idx_profiles_billing_name ON public.profiles(billing_name);

-- Comentario para verificar migración
COMMENT ON COLUMN public.profiles.billing_name IS 'Nombre que aparecerá en facturas (puede diferir del nombre profesional)';