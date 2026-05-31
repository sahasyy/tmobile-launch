"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import { LaunchFrame } from "@/components/LaunchFrame";

export default function Home() {
  const { ready, sample, stateRef, motionRef } = useCamera();

  useEffect(() => {
    let raf = 0;

    const loop = () => {
      sample();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sample]);

  return (
    <main className="relative h-dvh min-h-dvh w-screen overflow-hidden bg-[#f3f4f8]">
      <LaunchFrame stateRef={stateRef} motionRef={motionRef} ready={ready} />
    </main>
  );
}
