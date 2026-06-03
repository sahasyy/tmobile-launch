"use client";

import Image from "next/image";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { PanelText } from "./PanelText";

export function LaunchFrame() {
  return (
    <section className="relative min-h-dvh w-full bg-magenta lg:h-full">
      <div className="relative h-full w-full overflow-hidden bg-[#e8006e] p-[clamp(12px,1.3vw,22px)]">
        {/* Same GrainGradient wave as the panels — only the perimeter band
            is visible since the white bubble covers the center. */}
        <GradientBackground
          className="absolute inset-0"
          colorBack="hsl(332, 100%, 28%)"
          shape="wave"
          softness={0.85}
          intensity={0.65}
          noise={0.28}
          scale={1.4}
          speed={0.6}
          colors={[
            "hsl(328, 100%, 58%)",
            "hsl(340, 90%, 72%)",
            "hsl(318, 88%, 84%)",
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
              <Panel className="bg-[#fbe6f1] max-lg:min-h-[40dvh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(330, 80%, 95%)"
                  shape="wave"
                  softness={0.92}
                  intensity={0.6}
                  noise={0.3}
                  scale={1.2}
                  speed={0.75}
                  colors={[
                    "hsl(330, 90%, 90%)",
                    "hsl(326, 85%, 80%)",
                    "hsl(332, 80%, 70%)",
                  ]}
                />
                <div className="absolute inset-0 bg-white/25" />
                <PanelText tone="short" variant="dark">
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
