// Türkiye 2016'dan beri yaz/kış saati uygulamıyor: her zaman UTC+3.
const TR_OFFSET_MS = 3 * 60 * 60 * 1000

export const OPEN_HOUR = 0
export const CLOSE_HOUR = 5

/** Verilen anın Türkiye saatindeki saat/dakika/saniyesi */
export function trParts(date: Date = new Date()) {
  const t = new Date(date.getTime() + TR_OFFSET_MS)
  return {
    hours: t.getUTCHours(),
    minutes: t.getUTCMinutes(),
    seconds: t.getUTCSeconds(),
  }
}

export function isOpenAt(date: Date = new Date()) {
  return trParts(date).hours < CLOSE_HOUR
}

/** Kapanışa kalan dakika (kulüp açıkken) */
export function minutesUntilClose(date: Date = new Date()) {
  const { hours, minutes } = trParts(date)
  return Math.max(0, CLOSE_HOUR * 60 - (hours * 60 + minutes))
}

/** Açılışa kalan dakika (kulüp kapalıyken) */
export function minutesUntilOpen(date: Date = new Date()) {
  const { hours, minutes } = trParts(date)
  return 24 * 60 - (hours * 60 + minutes)
}

/** Bu gecenin başlangıcı (Türkiye saatiyle bugün 00:00), UTC olarak */
export function tonightStart(date: Date = new Date()) {
  const t = new Date(date.getTime() + TR_OFFSET_MS)
  t.setUTCHours(0, 0, 0, 0)
  return new Date(t.getTime() - TR_OFFSET_MS)
}

const pad = (n: number) => n.toString().padStart(2, "0")

/** "02:14" biçiminde Türkiye saati */
export function formatClock(date: Date = new Date()) {
  const { hours, minutes } = trParts(date)
  return `${pad(hours)}:${pad(minutes)}`
}

/** 185 → "3 saat 5 dakika" */
export function formatDuration(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} dakika`
  if (m === 0) return `${h} saat`
  return `${h} saat ${m} dakika`
}
