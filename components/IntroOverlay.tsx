"use client";

import { motion } from "framer-motion";

import { IntroCloudShader } from "./IntroCloudShader";

const EXPAND_EASE = [0.16, 1, 0.3, 1] as const;
const FADE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Arc-style intro overlay:
 * - White screen.
 * - A soft pink/white/magenta CLOUD orb (noisy) rotates from the start.
 * - It keeps rotating and GROWS to cover the entire screen.
 * - Then the whole overlay fades out, revealing the layout underneath
 *   (whose layers fade in on their own, sequenced).
 *
 * `onDone` fires when the overlay has fully faded out.
 */
export function IntroOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-white"
      initial={{ opacity: 1 }}
      // Hold opaque while the cloud grows, then fade the whole overlay out.
      animate={{ opacity: [1, 1, 0] }}
      transition={{
        duration: 4.8,
        times: [0, 0.76, 1],
        ease: FADE_EASE,
      }}
      onAnimationComplete={onDone}
    >
      {/* The rotating, growing cloud orb. We scale the wrapper (cheap, GPU)
          and let the shader render at its square canvas size. */}
      {/* The rotating, growing cloud. Starts as a soft orb, rotates + grows to
          cover the whole screen, morphing as it turns (the shader churns too). */}
      <motion.div
        className="relative aspect-square w-[55vmin] will-change-transform"
        style={{ transformOrigin: "center" }}
        initial={{ scale: 0.7, rotate: -14, opacity: 0 }}
        animate={{
          scale: [0.7, 1, 4.2],
          rotate: [-14, 0, 22],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 4.4,
          times: [0, 0.2, 1],
          ease: EXPAND_EASE,
        }}
      >
        <IntroCloudShader className="absolute inset-0 h-full w-full" />
      </motion.div>
    </motion.div>
  );
}
