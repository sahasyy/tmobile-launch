"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";

import { GradientBackground } from "@/components/ui/paper-design-shader-background";

import { BorderGrainShader } from "./BorderGrainShader";
import { IntroOverlay } from "./IntroOverlay";
import { PanelGrainGradientShader } from "./PanelGrainGradientShader";
import { PanelText } from "./PanelText";
import { SandBeamShader } from "./SandBeamShader";

type Phase = "intro" | "done";

// Sequential reveal timing (seconds), measured from when the overlay starts.
// The cloud grows/covers for ~3.6s; layers begin fading in under it just before
// the overlay fades out (~3.6–4.6s), so they're already present as it clears.
const T = {
  whiteStart: 3.5,
  p1Start: 3.85,
  p2Start: 4.25,
  p3Start: 4.65,
  fade: 0.7,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function LaunchFrame() {
  // Default "done" => SSR + first client render emit the final layout
  // (no hydration mismatch). Flip to "intro" only for flagged first-time visits.
  const [phase, setPhase] = useState<Phase>("done");
  const [showOverlay, setShowOverlay] = useState(false);
  const intro = phase === "intro";

  useEffect(() => {
    const root = document.documentElement;
    const shouldPlay =
      root.dataset.intro === "play" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldPlay) {
      root.removeAttribute("data-intro");
      return;
    }
    setPhase("intro");
    setShowOverlay(true);
  }, []);

  // Called when the overlay finishes fading out — mark seen and settle.
  const finishIntro = () => {
    try {
      localStorage.setItem("tmo-intro-seen", "1");
    } catch {}
    document.documentElement.removeAttribute("data-intro");
    setShowOverlay(false);
    setPhase("done");
  };

  // Per-layer reveal: hidden during intro, fading in on its delay; in the done
  // state we render at full opacity with no animation.
  const layerInitial = intro ? { opacity: 0 } : false;
  const layerAnimate = (start: number) =>
    intro
      ? {
          opacity: 1,
          transition: { duration: T.fade, delay: start, ease: T.ease },
        }
      : { opacity: 1 };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {showOverlay && <IntroOverlay key="intro" onDone={finishIntro} />}
      </AnimatePresence>

      <section className="relative min-h-dvh w-full bg-magenta md:h-full">
        <div className="relative h-full w-full overflow-hidden bg-magenta p-[clamp(26px,2.7vw,44px)]">
          <BorderGrainShader />

          {/* White inner background — fades in first. */}
          <motion.div
            data-intro-hidden
            className="relative h-full w-full overflow-hidden rounded-[clamp(48px,5.4vw,88px)] bg-white p-[clamp(24px,2.35vw,38px)]"
            initial={layerInitial}
            animate={layerAnimate(T.whiteStart)}
          >
            <div className="grid h-full w-full grid-cols-[1.05fr_0.95fr] gap-[clamp(24px,2.35vw,38px)] max-md:grid-cols-1">
              <Panel
                className="min-h-0 max-md:min-h-[56dvh]"
                initial={layerInitial}
                animate={layerAnimate(T.p1Start)}
              >
                <SandBeamShader />
                <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-magenta-800/95 via-magenta-700/65 to-transparent" />
                <PanelText tone="large">
                  I&rsquo;m joining
                  <br />
                  T&#8209;Mobile
                </PanelText>
              </Panel>

              <div className="grid min-h-0 grid-rows-2 gap-[clamp(24px,2.35vw,38px)] max-md:min-h-[76dvh]">
                <Panel
                  className="bg-[#f8f7f5]"
                  initial={layerInitial}
                  animate={layerAnimate(T.p2Start)}
                >
                  <PanelGrainGradientShader />
                  <div className="absolute inset-0 bg-white/10" />
                  <PanelText tone="short" variant="dark">
                    As a
                    <br />
                    ML Engineer
                  </PanelText>
                </Panel>

                <Panel
                  className="bg-[#5a002f]"
                  initial={layerInitial}
                  animate={layerAnimate(T.p3Start)}
                >
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
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Panel({
  children,
  className = "",
  ...motionProps
}: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      data-intro-hidden
      className={`relative isolate overflow-hidden rounded-[clamp(34px,4.25vw,74px)] bg-[#f7c6dd] ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
