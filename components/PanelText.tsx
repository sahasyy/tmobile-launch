"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  variant?: "light" | "dark";
  align?: "left" | "right";
  children: React.ReactNode;
}

export function PanelText({ variant = "light", align = "left", children }: Props) {
  // All cards share one heading size so they read as a set.
  const size = "text-[clamp(38px,5.2vw,104px)] leading-[0.92]";

  const color =
    variant === "dark"
      ? "text-[#271238] [text-shadow:0_1px_14px_rgba(255,255,255,0.36)]"
      : "text-white [text-shadow:0_1px_12px_rgba(32,16,120,0.12)]";

  return (
    <div className="absolute inset-x-[clamp(28px,4.5vw,86px)] bottom-[clamp(28px,4.6vw,88px)] z-20">
      <div
        role="heading"
        aria-level={1}
        className={`font-display font-light ${size} ${color} ${align === "right" ? "text-right" : ""} tracking-[0em]`}
      >
        {children}
      </div>
    </div>
  );
}

/** A line that stacks vertically (own row). */
export function Line({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`block ${className}`}>{children}</span>;
}

/**
 * A single word/segment that rises up "from the ground" and softly fades in.
 * Each gets an explicit `delay` so the whole site can play as one timeline.
 */
export function Word({
  children,
  delay = 0,
  duration = 0.85,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: "0.7em", filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        opacity: { duration: duration * 1.15, ease: "easeOut", delay },
        filter: { duration: duration * 1.15, ease: "easeOut", delay },
        y: { duration, ease: EASE, delay },
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
