"use client"

import { Meteors } from "@/components/magicui/meteors"
import { Particles } from "@/components/magicui/particles"

export function Sky() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={150}
        staticity={90}
        ease={90}
        size={0.45}
        color="#ECE6D3"
        vx={0.015}
        vy={0}
      />
      <div className="meteor-layer absolute inset-0">
        <Meteors
          number={4}
          minDelay={3}
          maxDelay={18}
          minDuration={7}
          maxDuration={13}
          className="bg-moon/60"
        />
      </div>
      <div className="moon absolute top-[7%] right-[10%] size-14 opacity-90 md:size-20" />
    </div>
  )
}
