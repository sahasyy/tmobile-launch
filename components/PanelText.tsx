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
  children: React.ReactNode;
}

export function PanelText({ tone = "short", children }: Props) {
  const size =
    tone === "large"
      ? "text-[clamp(54px,7vw,118px)] leading-[0.88]"
      : tone === "date"
        ? "text-[clamp(48px,5.8vw,96px)] leading-[0.86]"
        : "text-[clamp(58px,6.7vw,112px)] leading-[0.82]";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={copy}
      className="absolute inset-x-[clamp(24px,4.4vw,70px)] bottom-[clamp(24px,4.8vw,70px)] z-20"
    >
      <h1
        className={`font-display ${size} tracking-[0.01em] text-white [text-shadow:0_2px_22px_rgba(126,0,63,0.2)]`}
      >
        {children}
      </h1>
    </motion.div>
  );
}
