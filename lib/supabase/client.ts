"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/** Tarayıcıdaki Supabase istemcisi (herkese açık anahtarla, sadece okuma + canlı akış) */
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
