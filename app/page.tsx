"use client";

import { Confetti } from "@/components/Confetti";
import { LaunchFrame } from "@/components/LaunchFrame";

export default function Home() {
  return (
    <main className="relative min-h-dvh w-screen overflow-x-hidden overflow-y-auto bg-[#f3f4f8] lg:h-dvh lg:overflow-hidden">
      <LaunchFrame />
      <Confetti />
    </main>
  );
}
