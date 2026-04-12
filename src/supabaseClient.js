import { createClient } from '@supabase/supabase-js';

/**
 * ⚠️ CONFIGURACIÓN PENDIENTE ⚠️
 * Para que el sistema pase de Simulación a modo Producción (Nube Real),
 * debe crear un proyecto gratis en Supabase.com y reemplazar estas variables
 * con la URL de su proyecto y la Key Anónima pública.
 */

// Estas variables ideales deberían estar en un archivo .env local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-clave-anonima-publica';

export const supabase = createClient(supabaseUrl, supabaseKey);
