/**
 * Türkçe küfür filtresi.
 *
 * Yaklaşım:
 * 1. Metni küçük harfe çevir (Türkçe kurallarıyla: I → ı, İ → i).
 * 2. Harf/rakam oyunlarını çöz: 1→i, 0→o, 3→e, 4→a, 5→s, 7→t, @→a, $→s.
 * 3. Kelime içindeki nokta, tire, yıldız gibi işaretleri at: "a.m.k" → "amk".
 * 4. Tekrarlanan harfleri teke indir: "siiiiktir" → "siktir".
 * 5. Arka arkaya tek harfli kelimeleri birleştir: "a m k" → "amk".
 * 6. Kelimeleri listeyle karşılaştır.
 *
 * ı ile i bilerek ayrı tutulur. Böylece "sıkıldım", "sıkıntı" gibi masum
 * kelimeler yakalanmaz. Klavyesi Türkçe olmayanların yazdığı "sikildim" gibi
 * yazımlar için de ayrıca bir izin listesi var.
 * Hiçbir filtre kusursuz değildir. Kaçanlar için şikayet butonu var.
 */

const LEET: Record<string, string> = {
  "1": "i",
  "!": "i",
  "0": "o",
  "3": "e",
  "4": "a",
  "@": "a",
  "5": "s",
  $: "s",
  "7": "t",
}

// Kelimenin tamamı bunlardan biriyse engellenir
const EXACT = new Set([
  "amk", "amq", "aq", "awk", "mk", "mq", "oç", "oc", "piç", "pic", "göt",
  "yarak", "yarrak", "taşak", "taşşak", "tasak", "tassak", "sik", "sikik",
  "ibne", "puşt", "pust", "kahpe", "gavat", "pezevenk", "kaltak", "sürtük",
  "surtuk", "yavşak", "yavsak", "orospu", "orosbu", "amcık", "amcik",
  "dalyarak", "siktir", "siktirgit", "amına", "amina", "aminakoyim",
  "amınakoyim", "amınakoyayım", "skerim", "sktir", "skm", "sikem",
])

// Kelime bunlardan biriyle başlıyorsa engellenir
const PREFIXES = [
  "sik", "siktir", "orospu", "orosbu", "amcık", "amcik", "amına", "amina",
  "amını", "amini", "yarrak", "yarağ", "yarag", "pezevenk", "kahpe", "götün",
  "götver", "gotver", "ibne", "yavşak", "yavsak", "dalyarak", "kaltak",
  "puşt", "orsp", "sktir", "skerim", "sikey", "gavat",
]

// "sik" ile başlayan ama masum olan yazımlar (Türkçe karaktersiz klavye)
const ALLOW_PREFIXES = [
  "sikil", "sikic", "sikint", "sikist", "sikica",
]

function normalizeWord(raw: string) {
  let w = raw.toLocaleLowerCase("tr-TR")
  w = w.replace(/[10!3@4$57]/g, (c) => LEET[c] ?? c)
  // harf olmayan her şeyi at (Türkçe harfler korunur)
  w = w.replace(/[^a-zçğıöşü]/g, "")
  // tekrar eden harfleri teke indir
  w = w.replace(/(.)\1+/g, "$1")
  return w
}

function isBadWord(word: string) {
  if (!word) return false
  if (EXACT.has(word)) return true
  if (ALLOW_PREFIXES.some((p) => word.startsWith(p))) return false
  return PREFIXES.some((p) => word.startsWith(p))
}

export function containsProfanity(text: string) {
  const words = text.split(/\s+/).map(normalizeWord).filter(Boolean)

  for (const w of words) {
    if (isBadWord(w)) return true
  }

  // "a m k" gibi harf harf yazılmış küfürler: tek harflik kelime dizilerini birleştir
  let run = ""
  for (const w of [...words, ""]) {
    if (w.length === 1) {
      run += w
    } else {
      if (run.length >= 2 && isBadWord(run.replace(/(.)\1+/g, "$1"))) return true
      run = ""
    }
  }
  return false
}

/** Link, e-posta ve telefon numarası paylaşımını engeller (spam ve ifşa önlemi) */
export function containsContactInfo(text: string) {
  const lower = text.toLowerCase()
  const link = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|me|co|tr|xyz|link|ly|gg|app)\b)/i
  const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
  const phone = /(\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/
  return link.test(lower) || email.test(lower) || phone.test(lower)
}
