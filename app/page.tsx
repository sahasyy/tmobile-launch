"use client";

import { useEffect, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { LaunchFrame } from "@/components/LaunchFrame";

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
    <main className="relative h-dvh min-h-dvh w-screen overflow-hidden bg-[#f3f4f8]">
      <div
        ref={haloRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
      />
      <div className="relative z-10 h-full w-full">
        <LaunchFrame stateRef={stateRef} motionRef={motionRef} ready={ready} />
      </div>
    </main>
  );
}
