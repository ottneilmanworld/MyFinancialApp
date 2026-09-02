import { createClient } from '@supabase/supabase-js';

// Las llaves ahora viven en variables de entorno (.env, ignorado por git),
// no en el código fuente. Ver .env.example para la plantilla.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y completa tus valores.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
