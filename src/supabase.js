import { createClient } from '@supabase/supabase-js';

// Reemplaza AQUÍ con los valores que copiaste en PASO 4
const SUPABASE_URL = 'https://kiebkuplbctqynroppcr.supabase.co'; // Tu Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZWJrdXBsYmN0cXlucm9wcGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTMzNjMsImV4cCI6MjEwMTc4OTM2M30.oDvHknnaeIzkInH6VF8oa3CH8BPMXAriGKSstWtCG3Y'; // Tu anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);