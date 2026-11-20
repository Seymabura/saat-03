import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/**
 * Sunucuya özel Supabase istemcisi (gizli anahtarla).
 * Bu dosya asla tarayıcıya gönderilmez ("server-only").
 */
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
