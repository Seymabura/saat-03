import { Suspense } from "react"
import { Sky } from "@/components/sky"
import { Gate } from "@/components/gate"

export default function Page() {
  return (
    <>
      <Sky />
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Gate />
      </Suspense>
    </>
  )
}
