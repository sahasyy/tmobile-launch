"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { DitherBubble } from "./DitherBubble";
import { GradientBubble } from "./GradientBubble";
import { AsciiBubble } from "./AsciiBubble";
import { PanelText } from "./PanelText";
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
        <motion.div
          className="relative grid h-full w-full grid-cols-[1.05fr_0.95fr] gap-[clamp(18px,2vw,32px)] max-md:grid-cols-1"
          style={{ x: sx, y: sy }}
        >
          <Panel className="min-h-0 max-md:min-h-[52dvh]">
            <DitherBubble stateRef={stateRef} motionRef={motionRef} ready={ready} />
            <div className="absolute inset-0 bg-[#E20074]/34 mix-blend-screen" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.34),transparent_34%),linear-gradient(135deg,rgba(226,0,116,0.28),rgba(255,99,188,0.36))]" />
            <PanelText tone="large">
              I&rsquo;m joining
              <br />
              <span className="text-white [-webkit-text-stroke:1px_#E20074]">
                T&#8209;Mobile
              </span>
            </PanelText>
          </Panel>

          <div className="grid min-h-0 grid-rows-2 gap-[clamp(18px,2vw,32px)] max-md:min-h-[48dvh]">
            <Panel>
              <GradientBubble motionRef={motionRef} />
              <div className="absolute inset-0 bg-[#E20074]/14 mix-blend-screen" />
              <PanelText>ML Eng</PanelText>
            </Panel>

            <Panel>
              <AsciiBubble stateRef={stateRef} ready={ready} />
              <div className="absolute inset-0 bg-[#E20074]/18 mix-blend-screen" />
              <PanelText tone="date">
                Summer
                <br />
                2026
              </PanelText>
            </Panel>
          </div>
        </motion.div>
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
      className={`relative isolate overflow-hidden rounded-[clamp(34px,4.2vw,74px)] bg-[#ff5db8] ${className}`}
    >
      {children}
    </div>
  );
}
