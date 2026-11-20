"use client"

import { useState, useTransition } from "react"
import { FlagIcon } from "lucide-react"
import { toast } from "sonner"
import { reportMessage } from "@/app/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export function ReportButton({
  id,
  onRemoved,
}: {
  id: string
  onRemoved: (id: string) => void
}) {
  const [reported, setReported] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const res = await reportMessage(id)
      if (!res.ok) {
        toast.error(res.text)
        return
      }
      setReported(true)
      toast.success(res.text)
      if (res.status === "removed") onRemoved(id)
    })
  }

  if (reported) {
    return <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-haze/70">Şikayet edildi</span>
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-sm text-xs text-haze/70 transition-opacity",
            "hover:text-moon focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
            "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
          )}
        >
          <FlagIcon className="size-3.5" aria-hidden />
          Şikayet et
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-popover">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl font-normal">Bu mesajı şikayet et?</AlertDialogTitle>
          <AlertDialogDescription className="text-haze">
            Üç farklı kişi şikayet ederse mesaj duvardan kaldırılır. Kimin şikayet ettiği görünmez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Şikayet et</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
