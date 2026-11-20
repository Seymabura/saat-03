"use client"

import { useCallback, useEffect, useState } from "react"
import { AwakeCounter } from "@/components/awake-counter"
import { Composer } from "@/components/composer"
import { Wall } from "@/components/wall"
import { useBoundaryRefresh } from "@/components/use-boundary-refresh"
import { formatClock, formatDuration, minutesUntilClose } from "@/lib/time"
import type { Message } from "@/lib/types"

export function ClubRoom({
  initialMessages,
  serverNow,
}: {
  initialMessages: Message[]
  serverNow: string
}) {
  const [now, setNow] = useState(() => new Date(serverNow))
  const [messages, setMessages] = useState(initialMessages)
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5_000)
    return () => clearInterval(id)
  }, [])

  useBoundaryRefresh(now.getTime())

  const add = useCallback((m: Message) => {
    setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [m, ...prev].slice(0, 200)))
    setFreshIds((prev) => new Set(prev).add(m.id))
  }, [])

  const remove = useCallback((id: string) => {
    setMessages((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const [hh, mm] = formatClock(now).split(":")

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-24">
      <header className="flex items-center justify-between py-6">
        <span className="font-serif text-xl text-moon italic">Saat 03:00</span>
        <AwakeCounter />
      </header>

      <section className="pt-14 pb-14 text-center">
        <h1 className="sr-only">Saat 03:00, gece mesaj duvarı</h1>
        <p
          className="clock-digits text-[clamp(6.5rem,30vw,12.5rem)] leading-none font-extralight text-moon"
          aria-label={`Saat ${hh}:${mm}`}
        >
          {hh}
          <span className="mx-[0.02em] inline-block -translate-y-[0.06em] text-moon/50 motion-safe:animate-pulse">:</span>
          {mm}
        </p>
        <p className="mt-5 text-haze">
          05:00&apos;te kapanıyoruz.{" "}
          <span className="text-moon">{formatDuration(minutesUntilClose(now))}</span> kaldı.
        </p>
      </section>

      <Composer onSent={add} />
      <Wall messages={messages} freshIds={freshIds} onInsert={add} onRemove={remove} />
    </div>
  )
}
