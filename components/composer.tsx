"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { sendMessage } from "@/app/actions"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX = 280

export function Composer({ onSent }: { onSent: (m: Message) => void }) {
  const [text, setText] = useState("")
  const [pending, startTransition] = useTransition()
  const length = text.trim().length

  function submit() {
    if (pending || length < 2) return
    startTransition(async () => {
      const res = await sendMessage(text)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setText("")
      onSent(res.message)
      toast.success("Gönderildi. Artık duvarda.")
    })
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md transition-colors focus-within:border-sodium/40"
      >
        <label htmlFor="mesaj" className="sr-only">
          Mesajın
        </label>
        <Textarea
          id="mesaj"
          value={text}
          maxLength={MAX}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Seni bu saatte ayakta tutan ne?"
          className="min-h-24 resize-none border-0 bg-transparent p-0 font-serif text-xl leading-relaxed text-moon shadow-none placeholder:text-haze/60 focus-visible:ring-0 md:text-xl dark:bg-transparent"
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <span
            className={cn(
              "text-sm text-haze tabular-nums",
              text.length > MAX - 20 && "text-sodium",
            )}
          >
            {text.length}/{MAX}
          </span>
          <Button type="submit" disabled={pending || length < 2} className="h-10 rounded-full px-6 text-[0.95rem]">
            {pending ? "Gönderiliyor" : "Gönder"}
          </Button>
        </div>
        <BorderBeam size={90} duration={12} colorFrom="#F0A84B" colorTo="#ECE6D3" />
      </form>
      <p className="mt-3 text-sm text-haze/80">
        İsim yok, hesap yok. Mesajlar sabah 05:00&apos;te silinir.
      </p>
    </div>
  )
}
