"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const line: Variants = {
  hidden: { width: 0 },
  show: {
    width: "100%",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.1 },
  },
};

export function HeroText() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-20 max-w-[760px] pl-5"
    >
      <motion.h1
        variants={item}
        className="font-display text-[clamp(48px,7vw,96px)] leading-[0.94] tracking-[0.01em] text-neutral-900 [text-shadow:0_2px_18px_rgba(255,255,255,0.9)]"
      >
        I&rsquo;ll be an
        <br />
        ML intern
        <br />
        at{" "}
        <span className="text-white [-webkit-text-stroke:1px_#E20074] [text-shadow:0_2px_14px_rgba(226,0,116,0.45)]">
          T&#8209;Mobile
        </span>
        <br />
        this summer.
      </motion.h1>

      <motion.div
        variants={line}
        className="mt-5 h-[2px] max-w-[520px] bg-magenta"
      />
    </motion.div>
  );
}
