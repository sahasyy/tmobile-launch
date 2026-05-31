"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { DitherBubble } from "./DitherBubble";
import { GradientBubble } from "./GradientBubble";
import { AsciiBubble } from "./AsciiBubble";
import { HeroText } from "./HeroText";
import { BorderGrainShader } from "./BorderGrainShader";
import type { CameraMotion, CameraState } from "@/hooks/useCamera";

interface Props {
  stateRef: React.MutableRefObject<CameraState>;
  motionRef: React.MutableRefObject<CameraMotion>;
  ready: boolean;
}

export function LaunchFrame({ stateRef, motionRef, ready }: Props) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 34, damping: 22 });
  const sy = useSpring(py, { stiffness: 34, damping: 22 });

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const motion = motionRef.current;
      px.set(motion.x * 10);
      py.set(motion.y * 10);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionRef, px, py]);

  return (
    <section className="relative h-full w-full bg-[#f3f4f8] p-[clamp(18px,2.65vw,44px)]">
      <div className="relative h-full w-full overflow-hidden bg-magenta p-[clamp(18px,2vw,32px)]">
        <BorderGrainShader motionRef={motionRef} />
        <div className="relative h-full w-full overflow-hidden rounded-[clamp(42px,6vw,86px)] bg-white p-[clamp(18px,1.9vw,31px)]">
          <motion.div
            className="grid h-full w-full grid-cols-[1.05fr_0.95fr] gap-[clamp(18px,2.1vw,36px)] max-md:grid-cols-1"
            style={{ x: sx, y: sy }}
          >
            <Panel className="min-h-0 max-md:min-h-[52dvh]">
              <DitherBubble stateRef={stateRef} motionRef={motionRef} ready={ready} />
              <div className="absolute inset-0 bg-[#6244f5]/55 mix-blend-multiply" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,rgba(95,69,245,0.82),rgba(86,60,241,0.94))]" />
              <HeroText />
            </Panel>

            <div className="grid min-h-0 grid-rows-2 gap-[clamp(18px,2.1vw,36px)] max-md:min-h-[48dvh]">
              <Panel>
                <GradientBubble motionRef={motionRef} />
                <div className="absolute inset-0 bg-[#6042f3]/30 mix-blend-color" />
              </Panel>

              <Panel>
                <AsciiBubble stateRef={stateRef} ready={ready} />
                <div className="absolute inset-0 bg-[#5e42f2]/35 mix-blend-lighten" />
              </Panel>
            </div>
          </motion.div>
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
      className={`relative isolate overflow-hidden rounded-[clamp(34px,4.2vw,74px)] bg-[#6145f4] ${className}`}
    >
      {children}
    </div>
  );
}
