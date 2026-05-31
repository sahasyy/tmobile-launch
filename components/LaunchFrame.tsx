"use client";

import { BorderGrainShader } from "./BorderGrainShader";
import { PanelGrainGradientShader } from "./PanelGrainGradientShader";
import { PanelText } from "./PanelText";

export function LaunchFrame() {
  return (
    <section className="relative min-h-dvh w-full bg-[#f2f3f7] p-[clamp(12px,2.1vw,36px)] md:h-full">
      <div className="relative h-full w-full overflow-hidden bg-magenta p-[clamp(26px,2.7vw,44px)]">
        <BorderGrainShader />

        <div className="relative h-full w-full overflow-hidden rounded-[clamp(48px,5.4vw,88px)] bg-white p-[clamp(24px,2.35vw,38px)]">
          <div className="grid h-full w-full grid-cols-[1.05fr_0.95fr] gap-[clamp(24px,2.35vw,38px)] max-md:grid-cols-1">
            <Panel className="min-h-0 max-md:min-h-[56dvh]">
              <PanelFill />
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

              <Panel>
                <PanelFill />
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
      className={`relative isolate overflow-hidden rounded-[clamp(34px,4.25vw,74px)] bg-[#6043f4] ${className}`}
    >
      {children}
    </div>
  );
}

function PanelFill() {
  return (
    <>
      <div className="absolute inset-0 bg-[#6043f4]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.38),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(72,47,230,0))]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  );
}
