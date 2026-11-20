"use client"

import { useEffect, useState } from "react"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { getBrowserSupabase } from "@/lib/supabase/client"

/** "Şu an X kişi uyanık": Supabase Realtime Presence ile canlı sayaç */
export function AwakeCounter() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (!supabase) return

    const key = crypto.randomUUID()
    const channel = supabase.channel("saat03-uyanik", {
      config: { presence: { key } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Math.max(1, Object.keys(channel.presenceState()).length))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ since: Date.now() })
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <p className="flex items-center gap-2.5 text-sm text-haze" aria-live="polite">
      <span className="size-2 animate-lamp rounded-full bg-sodium" aria-hidden />
      <span>
        Şu an{" "}
        <NumberTicker
          value={count}
          startValue={1}
          className="font-medium tracking-normal text-moon dark:text-moon"
        />{" "}
        kişi uyanık
      </span>
    </p>
  )
}
