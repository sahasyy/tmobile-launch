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
        duration: 4.6,
        times: [0, 0.78, 1],
        ease: FADE_EASE,
      }}
      onAnimationComplete={onDone}
    >
      {/* The rotating, growing cloud orb. We scale the wrapper (cheap, GPU)
          and let the shader render at its square canvas size. */}
      <motion.div
        className="relative aspect-square w-[42vmin] will-change-transform"
        style={{ transformOrigin: "center" }}
        initial={{ scale: 0.86, rotate: -12, opacity: 0 }}
        animate={{
          // grow well past the viewport so the cloud fully covers it
          scale: [0.86, 1, 6.2],
          rotate: [-12, 0, 26],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 4.0,
          times: [0, 0.18, 1],
          ease: EXPAND_EASE,
        }}
      >
        <IntroCloudShader className="absolute inset-0 h-full w-full" />
        {/* extra soft halo to bleed the cloud into the white screen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 0 120px 40px rgba(226,0,116,0.18), 0 0 220px 80px rgba(255,150,205,0.25)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
