"use client";

import { Confetti } from "@/components/Confetti";
import { LaunchFrame } from "@/components/LaunchFrame";

export default function Home() {
  return (
    <main className="relative min-h-svh w-screen overflow-x-hidden bg-white lg:h-svh lg:overflow-hidden">
      <LaunchFrame />
      <Confetti />
    </main>
  );
}
