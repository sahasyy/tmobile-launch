"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { DitherBubble } from "./DitherBubble";
import { GradientBubble } from "./GradientBubble";
import { AsciiBubble } from "./AsciiBubble";
import type { CameraState, CameraMotion } from "@/hooks/useCamera";

interface Props {
  stateRef: React.MutableRefObject<CameraState>;
  motionRef: React.MutableRefObject<CameraMotion>;
  ready: boolean;
}

/**
 * Three bubbles arranged as large background elements:
 *   - one big (left), driven by the dither renderer
 *   - two small (right), gradient shader + ASCII feed
 * The whole cluster parallaxes subtly toward camera/cursor motion.
 */
export function Bubbles({ stateRef, motionRef, ready }: Props) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });

  // feed camera motion into the parallax springs
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const m = motionRef.current;
      px.set(m.x * 22);
      py.set(m.y * 22);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionRef, px, py]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0"
      style={{ x: sx, y: sy }}
      aria-hidden="true"
    >
      {/* BIG — dither, left of center */}
      <div className="absolute left-1/2 top-1/2 h-[clamp(320px,42vw,500px)] w-[clamp(320px,42vw,500px)] -translate-x-[116%] -translate-y-1/2 max-sm:-translate-x-[78%] max-sm:-translate-y-[64%]">
        <div className="h-full w-full animate-float-a overflow-hidden rounded-full opacity-[0.78] shadow-[0_30px_120px_-30px_rgba(226,0,116,0.35)]">
          <DitherBubble stateRef={stateRef} motionRef={motionRef} ready={ready} />
        </div>
      </div>

      {/* SMALL 1 — gradient shader, upper right */}
      <div className="absolute left-1/2 top-1/2 h-[clamp(132px,16vw,200px)] w-[clamp(132px,16vw,200px)] translate-x-[120%] -translate-y-[150%] max-sm:translate-x-[72%] max-sm:-translate-y-[188%]">
        <div className="h-full w-full animate-float-b overflow-hidden rounded-full shadow-[0_20px_80px_-20px_rgba(226,0,116,0.45)]">
          <GradientBubble motionRef={motionRef} />
        </div>
      </div>

      {/* SMALL 2 — ASCII feed, lower right */}
      <div className="absolute left-1/2 top-1/2 h-[clamp(110px,13vw,160px)] w-[clamp(110px,13vw,160px)] translate-x-[150%] translate-y-[40%] max-sm:translate-x-[86%] max-sm:translate-y-[82%]">
        <div className="h-full w-full animate-float-c overflow-hidden rounded-full shadow-[0_20px_70px_-20px_rgba(226,0,116,0.4)]">
          <AsciiBubble stateRef={stateRef} ready={ready} />
        </div>
      </div>
    </motion.div>
  );
}
