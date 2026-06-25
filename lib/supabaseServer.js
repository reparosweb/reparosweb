import { createClient } from "@supabase/supabase-js";

// Cliente para Server Components (somente leitura pública via anon key + RLS)
export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}
