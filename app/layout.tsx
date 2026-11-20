import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
// Yazı tipleri projenin içinde barınır (Google Fonts'a bağımlı değil)
import "@fontsource-variable/bricolage-grotesque/wdth.css"
import "@fontsource-variable/newsreader/opsz.css"
import "@fontsource-variable/newsreader/opsz-italic.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Saat 03:00",
  description:
    "Sadece gece 00:00 ile 05:00 arası açık. Uyuyamayanlar için anonim bir mesaj duvarı.",
}

export const viewport: Viewport = {
  themeColor: "#0b1230",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className="dark h-full antialiased"
    >
      <body className="min-h-full">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
