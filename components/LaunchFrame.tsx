"use client";

import Image from "next/image";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { Line, PanelText, Word } from "./PanelText";

// One shared text timeline (seconds). The cards are static; their text
// reveals one phrase at a time, each rising in from the ground only after
// the previous phrase has finished:
//   "I'm joining" → T-Mobile logo → "As an" → "ML Engineer" → "For" → "Summer 2026"
const LINE = 0.85; // phrase rise duration
const LOGO = 0.95; // logo rise duration
const GAP = 0.12; // pause between phrases
const T = (() => {
  const imJoining = 0.35;
  const logo = imJoining + LINE + GAP;
  const asAn = logo + LOGO + GAP;
  const mlEngineer = asAn + LINE + GAP;
  const forr = mlEngineer + LINE + GAP;
  const summer = forr + LINE + GAP;
  return { imJoining, logo, asAn, mlEngineer, forr, summer };
})();

export function LaunchFrame() {
  return (
    <section className="relative min-h-dvh w-full bg-magenta lg:h-full">
      <div className="relative h-full w-full overflow-hidden bg-white p-[clamp(22px,2.1vw,38px)]">
        {/* Border-only wave: white/blush base with a single magenta filament
            that sweeps through. The white bubble covers the center so the
            animation is fully isolated to the perimeter band. */}
        <GradientBackground
          className="absolute inset-0"
          colorBack="hsl(0, 0%, 100%)"
          shape="wave"
          softness={0.95}
          intensity={0.62}
          noise={0.2}
          scale={2.2}
          speed={0.5}
          colors={[
            "hsl(0, 0%, 100%)",
            "hsl(330, 60%, 95%)",
            "hsl(327, 100%, 44%)",
          ]}
        />

        <div className="relative h-full w-full overflow-hidden rounded-[clamp(48px,5.4vw,88px)] bg-white p-[clamp(24px,2.35vw,38px)]">
          <div className="grid h-full w-full grid-cols-1 gap-[clamp(20px,2.35vw,38px)] lg:grid-cols-[1.05fr_0.95fr]">
            <Panel className="min-h-0 bg-[#4a0026] max-lg:min-h-[56dvh]">
              <GradientBackground
                className="absolute inset-0"
                colorBack="hsl(320, 100%, 19%)"
                shape="wave"
                softness={0.9}
                intensity={0.68}
                noise={0.3}
                scale={1.35}
                speed={0.7}
                colors={[
                  "hsl(322, 100%, 46%)",
                  "hsl(318, 90%, 62%)",
                  "hsl(316, 88%, 80%)",
                ]}
              />
              <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-[#3a0420]/85 via-[#5a002f]/45 to-transparent" />
              {/* Faint lily ASCII art: above the shader, below the heading text. */}
              <Image
                src="/lily-ascii.png"
                alt=""
                aria-hidden
                width={2152}
                height={2149}
                unoptimized
                className="pointer-events-none absolute left-1/2 top-[52%] z-10 h-[110%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-60 select-none"
              />
              <PanelText>
                <Line>
                  <Word delay={T.imJoining} duration={LINE}>
                    I&rsquo;m joining
                  </Word>
                </Line>
                <Line>
                  <Word delay={T.logo} duration={LOGO}>
                    <Image
                      src="/tmobile-logo.png"
                      alt="T-Mobile"
                      width={3561}
                      height={720}
                      priority
                      unoptimized
                      className="mt-[0.22em] block h-[clamp(52px,7vw,132px)] w-auto drop-shadow-[0_2px_18px_rgba(32,16,120,0.2)]"
                    />
                  </Word>
                </Line>
              </PanelText>
            </Panel>

            <div className="contents lg:grid lg:min-h-0 lg:grid-rows-2 lg:gap-[clamp(24px,2.35vw,38px)]">
              <Panel className="bg-[#3d0035] max-lg:min-h-[40dvh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(330, 100%, 9%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.7}
                  noise={0.3}
                  scale={1.3}
                  speed={0.78}
                  colors={[
                    "hsl(330, 100%, 34%)",
                    "hsl(331, 88%, 48%)",
                    "hsl(332, 80%, 64%)",
                  ]}
                />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#3d0035]/80 via-[#3d0035]/35 to-transparent" />
                {/* Faint butterfly ASCII art: above the shader, below the heading text. */}
                <Image
                  src="/butterfly-ascii.png"
                  alt=""
                  aria-hidden
                  width={2152}
                  height={933}
                  unoptimized
                  className="pointer-events-none absolute left-[72%] top-[52%] z-10 w-[128%] h-auto max-w-none -translate-x-1/2 -translate-y-1/2 -scale-x-100 object-contain opacity-60 select-none"
                />
                <PanelText>
                  <Line>
                    <Word delay={T.asAn} duration={LINE}>
                      As an
                    </Word>
                  </Line>
                  <Line>
                    <Word delay={T.mlEngineer} duration={LINE}>
                      ML Engineer
                    </Word>
                  </Line>
                </PanelText>
              </Panel>

              <Panel className="bg-[#5a002f] max-lg:min-h-[40dvh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(329, 100%, 21%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.72}
                  noise={0.32}
                  scale={1.25}
                  speed={0.85}
                  colors={[
                    "hsl(329, 100%, 52%)",
                    "hsl(328, 92%, 68%)",
                    "hsl(327, 90%, 85%)",
                  ]}
                />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#3a0420]/55 to-transparent" />
                {/* Faint lily ASCII art: above the shader, below the heading text. */}
                <Image
                  src="/lily-ascii-2.png"
                  alt=""
                  aria-hidden
                  width={2152}
                  height={1446}
                  unoptimized
                  className="pointer-events-none absolute left-[26%] top-[52%] z-10 w-[128%] h-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-60 select-none"
                />
                <PanelText align="right">
                  <Line>
                    <Word delay={T.forr} duration={LINE}>
                      For
                    </Word>
                  </Line>
                  <Line>
                    <Word delay={T.summer} duration={LINE}>
                      Summer 2026
                    </Word>
                  </Line>
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
