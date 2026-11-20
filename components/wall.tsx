"use client"

import { useEffect } from "react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { ReportButton } from "@/components/report-button"
import { getBrowserSupabase } from "@/lib/supabase/client"
import { formatClock } from "@/lib/time"
import type { Message } from "@/lib/types"

export function Wall({
  messages,
  freshIds,
  onInsert,
  onRemove,
}: {
  messages: Message[]
  freshIds: Set<string>
  onInsert: (m: Message) => void
  onRemove: (id: string) => void
}) {
  // Yeni mesajlar ve silinenler canlı gelsin
  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (!supabase) return
    const channel = supabase
      .channel("saat03-duvar")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "saat03_messages" },
        (payload) => {
          const m = payload.new as Message
          onInsert({ id: m.id, body: m.body, created_at: m.created_at })
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "saat03_messages" },
        (payload) => {
          const old = payload.old as { id?: string }
          if (old.id) onRemove(old.id)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onInsert, onRemove])

  return (
    <section aria-labelledby="duvar-baslik" className="mt-16">
      <h2 id="duvar-baslik" className="font-serif text-2xl text-moon italic">
        Bu gece yazılanlar
      </h2>

      {messages.length === 0 ? (
        <p className="mt-6 text-haze">Henüz kimse yazmadı. İlk mesajı sen yaz.</p>
      ) : (
        <ol className="mt-4 divide-y divide-border/70" aria-live="polite">
          {messages.map((m) => {
            const item = (
              <div className="group grid grid-cols-[3.25rem_1fr] gap-4 py-6">
                <time
                  dateTime={m.created_at}
                  className="pt-1.5 text-sm text-haze tabular-nums"
                >
                  {formatClock(new Date(m.created_at))}
                </time>
                <div className="min-w-0">
                  <p className="font-serif text-[1.2rem] leading-relaxed break-words whitespace-pre-wrap text-moon">
                    {m.body}
                  </p>
                  <ReportButton id={m.id} onRemoved={onRemove} />
                </div>
              </div>
            )
            return (
              <li key={m.id}>
                {freshIds.has(m.id) ? <BlurFade duration={0.5}>{item}</BlurFade> : item}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
