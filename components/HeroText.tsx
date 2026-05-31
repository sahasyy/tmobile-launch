"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.25 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroText() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="absolute inset-x-[clamp(26px,4.8vw,72px)] bottom-[clamp(28px,5vw,78px)] z-20 max-w-[620px]"
    >
      <motion.h1
        variants={item}
        className="font-display text-[clamp(48px,6.4vw,104px)] leading-[0.9] tracking-[0.01em] text-white [text-shadow:0_2px_24px_rgba(22,12,82,0.28)]"
      >
        I&rsquo;ll be an
        <br />
        ML intern
        <br />
        at{" "}
        <span className="text-[#ff5dbc] [-webkit-text-stroke:1px_rgba(255,255,255,0.72)] [text-shadow:none]">
          T&#8209;Mobile
        </span>
        <br />
        this summer.
      </motion.h1>
    </motion.div>
  );
}
