import { connection } from "next/server"
import { ClosedView } from "@/components/closed-view"
import { ClubRoom } from "@/components/club-room"
import { isClubOpen } from "@/lib/club-state"
import { getServerSupabase } from "@/lib/supabase/server"
import { minutesUntilOpen, tonightStart } from "@/lib/time"
import type { Message } from "@/lib/types"

async function loadTonight(now: Date): Promise<Message[]> {
  const supabase = getServerSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("saat03_messages")
    .select("id, body, created_at")
    .gte("created_at", tonightStart(now).toISOString())
    .order("created_at", { ascending: false })
    .limit(150)
  if (error) {
    console.error("messages", error)
    return []
  }
  return data ?? []
}

/** Kapıdaki görevli: saate bakar, içeri alır ya da "git uyu" der. */
export async function Gate() {
  await connection() // her istekte yeniden karar ver, asla önbellekten değil
  const now = new Date()

  if (!isClubOpen(now)) {
    return <ClosedView initialMinutes={minutesUntilOpen(now)} />
  }

  const messages = await loadTonight(now)
  return <ClubRoom initialMessages={messages} serverNow={now.toISOString()} />
}
