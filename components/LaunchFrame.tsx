"use client";

import Image from "next/image";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { PanelText } from "./PanelText";

export function LaunchFrame() {
  return (
    <section className="relative min-h-dvh w-full bg-magenta lg:h-full">
      <div className="relative h-full w-full overflow-hidden bg-[#fce8f3] p-[clamp(12px,1.3vw,22px)]">
        {/* Border-only wave: white/blush base with a single magenta filament
            that sweeps through. The white bubble covers the center so the
            animation is fully isolated to the perimeter band. */}
        <GradientBackground
          className="absolute inset-0"
          colorBack="hsl(330, 60%, 97%)"
          shape="wave"
          softness={0.94}
          intensity={0.55}
          noise={0.22}
          scale={1.5}
          speed={0.5}
          colors={[
            "hsl(330, 40%, 96%)",
            "hsl(334, 55%, 88%)",
            "hsl(327, 100%, 44%)",
          ]}
        />

        <div className="relative h-full w-full overflow-hidden rounded-[clamp(48px,5.4vw,88px)] bg-white p-[clamp(24px,2.35vw,38px)]">
          <div className="grid h-full w-full grid-cols-1 gap-[clamp(20px,2.35vw,38px)] lg:grid-cols-[1.05fr_0.95fr]">
            <Panel className="min-h-0 bg-[#4a0026] max-lg:min-h-[56dvh]">
              <GradientBackground
                className="absolute inset-0"
                colorBack="hsl(330, 100%, 22%)"
                shape="wave"
                softness={0.9}
                intensity={0.68}
                noise={0.3}
                scale={1.35}
                speed={0.7}
                colors={[
                  "hsl(330, 100%, 50%)",
                  "hsl(326, 85%, 66%)",
                  "hsl(336, 95%, 84%)",
                ]}
              />
              <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-[#3a0420]/85 via-[#5a002f]/45 to-transparent" />
              <PanelText tone="large">
                I&rsquo;m joining
                <Image
                  src="/tmobile-logo.png"
                  alt="T-Mobile"
                  width={3561}
                  height={720}
                  priority
                  unoptimized
                  className="mt-[0.22em] block h-[clamp(52px,7vw,132px)] w-auto drop-shadow-[0_2px_18px_rgba(32,16,120,0.2)]"
                />
              </PanelText>
            </Panel>

            <div className="contents lg:grid lg:min-h-0 lg:grid-rows-2 lg:gap-[clamp(24px,2.35vw,38px)]">
              <Panel className="bg-[#3d0035] max-lg:min-h-[40dvh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(315, 100%, 14%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.7}
                  noise={0.3}
                  scale={1.3}
                  speed={0.78}
                  colors={[
                    "hsl(315, 90%, 42%)",
                    "hsl(325, 82%, 58%)",
                    "hsl(334, 88%, 76%)",
                  ]}
                />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#3d0035]/80 via-[#3d0035]/35 to-transparent" />
                <PanelText tone="short">
                  As a
                  <br />
                  ML Engineer
                </PanelText>
              </Panel>

              <Panel className="bg-[#5a002f] max-lg:min-h-[40dvh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(327, 100%, 18%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.72}
                  noise={0.32}
                  scale={1.25}
                  speed={0.85}
                  colors={[
                    "hsl(327, 100%, 44%)",
                    "hsl(322, 78%, 60%)",
                    "hsl(332, 88%, 80%)",
                  ]}
                />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#3a0420]/55 to-transparent" />
                <PanelText tone="date">
                  for
                  <br />
                  Summer 2026
                </PanelText>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-[clamp(34px,4.25vw,74px)] bg-[#f7c6dd] ${className}`}
    >
      {children}
    </div>
  );
}
