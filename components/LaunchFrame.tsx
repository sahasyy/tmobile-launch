"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { Line, PanelText, Word } from "./PanelText";

// One shared text timeline (seconds). The cards are static; their text
// reveals word by word, each word rising in from the ground in order:
//   I'm · joining → logo → As · an · ML · Engineer → For · Summer · 2026
const WORD = 0.75; // per-word rise duration
const LOGO = 0.8; // logo rise duration
const SAME = 0.2; // gap to next word on the same line
const NEXT = 0.4; // gap to a new line / new card
const T = (() => {
  const imJoining = 0.4;
  const joining = imJoining + SAME;
  const logo = joining + NEXT;
  const asW = logo + NEXT;
  const anW = asW + SAME;
  const mlW = anW + NEXT;
  const engineerW = mlW + SAME;
  const forW = engineerW + NEXT;
  const summerW = forW + NEXT;
  const y2026W = summerW + SAME;
  return { imJoining, joining, logo, asW, anW, mlW, engineerW, forW, summerW, y2026W };
})();

export function LaunchFrame() {
  // Fade the whole frame in once on mount so the WebGL shaders, images, and
  // font all resolve behind a single clean fade instead of popping in.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      className={`relative min-h-svh w-full bg-magenta transition-opacity duration-[600ms] ease-out lg:h-full ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
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
            <Panel className="min-h-0 bg-[#4a0026] max-lg:min-h-[56svh]">
              <GradientBackground
                className="absolute inset-0"
                colorBack="hsl(320, 100%, 19%)"
                shape="wave"
                softness={0.9}
                intensity={0.68}
                noise={0.3}
                scale={1.35}
                rotation={0}
                offsetX={-0.3}
                offsetY={0.22}
                speed={0.88}
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
                  <Word delay={T.imJoining} duration={WORD}>
                    I&rsquo;m
                  </Word>{" "}
                  <Word delay={T.joining} duration={WORD}>
                    joining
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
              <Panel className="bg-[#3d0035] max-lg:min-h-[40svh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(330, 100%, 9%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.7}
                  noise={0.3}
                  scale={1.7}
                  rotation={35}
                  offsetX={0.34}
                  offsetY={-0.28}
                  speed={1.6}
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
                    <Word delay={T.asW} duration={WORD}>
                      As
                    </Word>{" "}
                    <Word delay={T.anW} duration={WORD}>
                      an
                    </Word>
                  </Line>
                  <Line>
                    <Word delay={T.mlW} duration={WORD}>
                      ML
                    </Word>{" "}
                    <Word delay={T.engineerW} duration={WORD}>
                      Engineer
                    </Word>
                  </Line>
                </PanelText>
              </Panel>

              <Panel className="bg-[#5a002f] max-lg:min-h-[40svh]">
                <GradientBackground
                  className="absolute inset-0"
                  colorBack="hsl(329, 100%, 21%)"
                  shape="wave"
                  softness={0.88}
                  intensity={0.72}
                  noise={0.32}
                  scale={1.05}
                  rotation={55}
                  offsetX={0.18}
                  offsetY={0.4}
                  speed={1.3}
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
                    <Word delay={T.forW} duration={WORD}>
                      For
                    </Word>
                  </Line>
                  <Line>
                    <Word delay={T.summerW} duration={WORD}>
                      Summer
                    </Word>{" "}
                    <Word delay={T.y2026W} duration={WORD}>
                      2026
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
