"use client";

import { useEffect, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Bubbles } from "@/components/Bubbles";
import { HeroText } from "@/components/HeroText";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Spotlight } from "@/components/ui/spotlight";

export default function Home() {
  const { ready, sample, stateRef, motionRef } = useCamera();
  const haloRef = useRef<HTMLDivElement | null>(null);

  // single master loop: sample camera + drive the edge halo
  useEffect(() => {
    let raf = 0;
    let smX = 0;
    let smY = 0;

    const loop = () => {
      sample();
      const m = motionRef.current;
      smX += (m.x - smX) * 0.08;
      smY += (m.y - smY) * 0.08;

      if (haloRef.current) {
        const ox = 50 + smX * 12;
        const oy = 50 + smY * 12;
        haloRef.current.style.background = `radial-gradient(ellipse 55% 55% at ${ox}% ${oy}%, transparent 55%, rgba(226,0,116,0.10) 72%, rgba(226,0,116,0.26) 100%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sample, motionRef]);

  return (
    <main className="relative h-dvh min-h-dvh w-screen overflow-hidden bg-white">
      {/* edge halo (camera reactive) */}
      <div ref={haloRef} className="pointer-events-none absolute inset-0 z-[1]" />

      {/* aurora glow, top-right */}
      <AuroraBackground />

      {/* spotlight sweeping the hero */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

      {/* the three camera-driven bubbles */}
      <Bubbles stateRef={stateRef} motionRef={motionRef} ready={ready} />

      {/* hero copy */}
      <div className="relative z-20 flex h-full w-full items-center">
        <div className="ml-[6vw]">
          <HeroText />
        </div>
      </div>
    </main>
  );
}
