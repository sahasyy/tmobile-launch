"use client";

import { motion, type Variants } from "framer-motion";

const copy: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

interface Props {
  tone?: "large" | "short" | "date";
  variant?: "light" | "dark";
  children: React.ReactNode;
}

export function PanelText({ tone = "short", variant = "light", children }: Props) {
  const size =
    tone === "large"
      ? "text-[clamp(52px,7.6vw,150px)] leading-[0.9]"
      : tone === "date"
        ? "text-[clamp(38px,5.2vw,104px)] leading-[0.92]"
        : "text-[clamp(42px,5.8vw,116px)] leading-[0.92]";

  const color =
    variant === "dark"
      ? "text-[#271238] [text-shadow:0_1px_14px_rgba(255,255,255,0.36)]"
      : "text-white [text-shadow:0_1px_12px_rgba(32,16,120,0.12)]";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={copy}
      className="absolute inset-x-[clamp(28px,4.5vw,86px)] bottom-[clamp(28px,4.6vw,88px)] z-20"
    >
      <div
        role="heading"
        aria-level={1}
        className={`font-display font-light ${size} ${color} tracking-[0em]`}
      >
        {children}
      </div>
    </motion.div>
  );
}
