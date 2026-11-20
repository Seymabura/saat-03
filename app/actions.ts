"use server"

import { isClubOpen } from "@/lib/club-state"
import { visitorHash } from "@/lib/fingerprint"
import { containsContactInfo, containsProfanity } from "@/lib/profanity"
import { getServerSupabase } from "@/lib/supabase/server"
import type { Message } from "@/lib/types"

export type SendResult =
  | { ok: true; message: Message }
  | { ok: false; error: string }

export type ReportResult = { ok: boolean; status: string; text: string }

const CLOSED_TEXT = "Kulüp kapandı. Kapılar gece 00:00'da yeniden açılıyor."

export async function sendMessage(raw: unknown): Promise<SendResult> {
  if (typeof raw !== "string") return { ok: false, error: "Mesaj okunamadı." }

  const body = raw
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!isClubOpen()) return { ok: false, error: CLOSED_TEXT }
  if (body.length < 2) return { ok: false, error: "Mesaj en az 2 karakter olmalı." }
  if (body.length > 280) return { ok: false, error: "Mesaj en fazla 280 karakter olabilir." }
  if (containsContactInfo(body))
    return { ok: false, error: "Link, e-posta veya telefon numarası paylaşılamaz." }
  if (containsProfanity(body))
    return { ok: false, error: "Mesajında küfür var. Düzeltip tekrar gönder." }

  const supabase = getServerSupabase()
  if (!supabase) return { ok: false, error: "Sunucu ayarları eksik (Supabase)." }

  const { data, error } = await supabase.rpc("saat03_post_message", {
    p_body: body,
    p_author: await visitorHash("post"),
  })

  if (error) {
    if (error.message.includes("rate_limited"))
      return { ok: false, error: "Biraz yavaş. 30 saniyede bir mesaj gönderebilirsin." }
    if (error.message.includes("closed")) return { ok: false, error: CLOSED_TEXT }
    if (error.message.includes("length"))
      return { ok: false, error: "Mesaj 2 ile 280 karakter arasında olmalı." }
    console.error("saat03_post_message", error)
    return { ok: false, error: "Mesaj gönderilemedi. Birazdan tekrar dene." }
  }

  const m = data as Message
  return { ok: true, message: { id: m.id, body: m.body, created_at: m.created_at } }
}

export async function reportMessage(id: unknown): Promise<ReportResult> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return { ok: false, status: "invalid", text: "Mesaj bulunamadı." }
  if (!isClubOpen()) return { ok: false, status: "closed", text: CLOSED_TEXT }

  const supabase = getServerSupabase()
  if (!supabase) return { ok: false, status: "config", text: "Sunucu ayarları eksik (Supabase)." }

  const { data, error } = await supabase.rpc("saat03_report_message", {
    p_id: id,
    p_reporter: await visitorHash("report"),
  })

  if (error) {
    console.error("saat03_report_message", error)
    return { ok: false, status: "error", text: "Şikayet gönderilemedi. Birazdan tekrar dene." }
  }

  switch (data as string) {
    case "already":
      return { ok: true, status: "already", text: "Bu mesajı zaten şikayet ettin." }
    case "removed":
      return { ok: true, status: "removed", text: "Şikayet edildi. Mesaj duvardan kaldırıldı." }
    case "missing":
      return { ok: true, status: "removed", text: "Bu mesaj artık duvarda değil." }
    default:
      return { ok: true, status: "ok", text: "Şikayet edildi. Teşekkürler." }
  }
}
