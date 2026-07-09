import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabase = hasSupabase
  ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

export function requireData<T>(data: T | null, error: { message: string } | null) {
  if (error) throw new Error(error.message);
  return data as T;
}
