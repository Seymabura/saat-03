"use client"

import { useEffect, useState } from "react"
import { formatDuration, minutesUntilOpen } from "@/lib/time"
import { useBoundaryRefresh } from "@/components/use-boundary-refresh"

export function ClosedView({ initialMinutes }: { initialMinutes: number }) {
  const [minutes, setMinutes] = useState(initialMinutes)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMinutes(minutesUntilOpen())
      setTick((t) => t + 1)
    }, 15_000)
    return () => clearInterval(id)
  }, [])

  useBoundaryRefresh(tick)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-serif text-xl text-haze italic">Saat 03:00</p>
      <h1 className="clock-digits mt-8 text-[clamp(4.5rem,17vw,10rem)] leading-[0.88] font-extralight tracking-tight text-moon">
        Kapalıyız.
      </h1>
      <p className="mt-5 font-serif text-4xl text-moon/90 italic md:text-5xl">Git uyu.</p>
      <div className="mt-14 max-w-sm space-y-2 text-lg leading-relaxed text-haze">
        <p>Kulüp sadece gece 00:00 ile 05:00 arasında açık.</p>
        <p>
          Kapılar <span className="text-moon tabular-nums">{formatDuration(minutes)}</span> sonra
          açılıyor.
        </p>
      </div>
    </main>
  )
}
