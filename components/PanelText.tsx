"use client";

import { motion, type Variants } from "framer-motion";

const copy: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
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
      ? "text-[clamp(52px,6.4vw,108px)] leading-[0.88]"
      : tone === "date"
        ? "text-[clamp(38px,4.4vw,78px)] leading-[0.9]"
        : "text-[clamp(42px,4.9vw,82px)] leading-[0.9]";

  const color =
    variant === "dark"
      ? "text-[#271238] [text-shadow:0_1px_14px_rgba(255,255,255,0.36)]"
      : "text-white [text-shadow:0_1px_12px_rgba(32,16,120,0.12)]";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={copy}
      className="absolute inset-x-[clamp(28px,4.5vw,72px)] bottom-[clamp(28px,4.6vw,74px)] z-20"
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
