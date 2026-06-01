"use client";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { BorderGrainShader } from "./BorderGrainShader";
import { PanelGrainGradientShader } from "./PanelGrainGradientShader";
import { PanelText } from "./PanelText";
import { SandBeamShader } from "./SandBeamShader";

export function LaunchFrame() {
  return (
    <section className="relative min-h-dvh w-full bg-[#f2f3f7] p-[clamp(12px,2.1vw,36px)] md:h-full">
      <div className="relative h-full w-full overflow-hidden bg-magenta p-[clamp(26px,2.7vw,44px)]">
        <BorderGrainShader />

        <div className="relative h-full w-full overflow-hidden rounded-[clamp(48px,5.4vw,88px)] bg-white p-[clamp(24px,2.35vw,38px)]">
          <div className="grid h-full w-full grid-cols-[1.05fr_0.95fr] gap-[clamp(24px,2.35vw,38px)] max-md:grid-cols-1">
            <Panel className="min-h-0 max-md:min-h-[56dvh]">
              <SandBeamShader />
              <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-magenta-800/95 via-magenta-700/65 to-transparent" />
              <PanelText tone="large">
                I&rsquo;m joining
                <br />
                T&#8209;Mobile
              </PanelText>
            </Panel>

            <div className="grid min-h-0 grid-rows-2 gap-[clamp(24px,2.35vw,38px)] max-md:min-h-[76dvh]">
              <Panel className="bg-[#f8f7f5]">
                <PanelGrainGradientShader />
                <div className="absolute inset-0 bg-white/10" />
                <PanelText tone="short" variant="dark">
                  As a
                  <br />
                  ML Engineer
                </PanelText>
              </Panel>

              <Panel className="bg-[#3a0420]">
                <GradientBackground
                  className="absolute inset-0"
                  colors={[
                    "hsl(327, 100%, 44%)",
                    "hsl(338, 88%, 62%)",
                    "hsl(348, 92%, 74%)",
                  ]}
                />
                <div className="absolute inset-0 bg-[#3a0420]/25" />
                <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#2a0317]/35 to-transparent" />
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
