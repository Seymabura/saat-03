import "server-only"
import { isOpenAt } from "@/lib/time"

/**
 * Kulüp açık mı? Kararı her zaman sunucu verir; tarayıcının saati önemsizdir.
 * Geliştirme sırasında gündüz test edebilmek için FORCE_CLUB_STATE=open|closed
 * kullanılabilir. Bu ayar canlı sitede (production) yok sayılır.
 */
export function isClubOpen(now: Date = new Date()) {
  if (process.env.NODE_ENV !== "production") {
    const forced = process.env.FORCE_CLUB_STATE
    if (forced === "open") return true
    if (forced === "closed") return false
  }
  return isOpenAt(now)
}
