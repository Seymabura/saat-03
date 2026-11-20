# Saat 03:00

Sadece gece **00:00 ile 05:00** (Türkiye saati) arasında açık anonim mesaj duvarı.
Gündüz gelenler "Kapalıyız. Git uyu." ekranını görür.

## Özellikler

- Saat kontrolü sunucuda ve veritabanında yapılır. Bilgisayar saatini değiştirmek işe yaramaz.
- Anonim mesaj duvarı (en fazla 280 karakter), yeni mesajlar canlı düşer
- "Şu an X kişi uyanık" canlı sayacı (Supabase Realtime Presence)
- Türkçe küfür filtresi: harf oyunlarını (`s1kt1r`, `a.m.k`, `a m k`) yakalar, "sıkıldım" gibi kelimeleri yakalamaz
- Link, e-posta ve telefon numarası engeli
- Spam limiti: 30 saniyede 1 mesaj, saatte en fazla 20 mesaj
- Şikayet butonu: 3 farklı kişi şikayet ederse mesaj duvardan kalkar
- Mesajlar her sabah 05:05'te silinir
- IP adresleri saklanmaz, sadece tuzlanmış özetleri tutulur

## Teknolojiler

Next.js 16, Tailwind CSS 4, shadcn/ui, Magic UI, Supabase, Vercel

## Kurulum

1. Supabase'de yeni bir proje aç. `supabase/schema.sql` dosyasını SQL Editor'de çalıştır.
2. `.env.example` dosyasını `.env.local` adıyla kopyala ve değerleri doldur.
3. `npm install` ve ardından `npm run dev` komutlarını çalıştır.

Gündüz test etmek için `.env.local` dosyasına `FORCE_CLUB_STATE=open` ekle. Bu ayar sadece geliştirmede çalışır, canlı sitede etkisizdir.
