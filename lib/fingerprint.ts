import "server-only"
import { createHash } from "node:crypto"
import { headers } from "next/headers"

/**
 * Ziyaretçinin IP adresinin tuzlanmış özeti.
 * IP'nin kendisi hiçbir yerde saklanmaz; sadece spam limiti ve
 * "aynı kişi iki kez şikayet etmesin" kontrolü için kullanılır.
 */
export async function visitorHash(purpose: "post" | "report") {
  const h = await headers()
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  const salt = process.env.HASH_SALT ?? "gelistirme-tuzu"
  return createHash("sha256").update(`${salt}:${purpose}:${ip}`).digest("hex")
}
