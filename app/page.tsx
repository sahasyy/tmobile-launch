"use client";

import { Confetti } from "@/components/Confetti";
import { LaunchFrame } from "@/components/LaunchFrame";

export default function Home() {
  return (
    <main className="relative h-dvh w-screen overflow-y-auto overflow-x-hidden overscroll-none bg-white lg:overflow-hidden">
      <LaunchFrame />
      <Confetti />
    </main>
  );
}
