"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { isOpenAt } from "@/lib/time"

/**
 * Saat 00:00 veya 05:00 sınırı geçildiğinde sayfayı sunucudan yeniler.
 * Kararı yine sunucu verir; tarayıcı sadece "artık sorabilirsin" der.
 */
export function useBoundaryRefresh(tick: number) {
  const router = useRouter()
  const last = useRef<boolean | null>(null)

  useEffect(() => {
    const open = isOpenAt(new Date())
    if (last.current !== null && last.current !== open) router.refresh()
    last.current = open
  }, [tick, router])
}
