"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const IMAGES = ["/tmobile.png", "/tmobile1.png", "/tmobile2.png"];

interface Piece {
  id: number;
  src: string;
  left: number; // vw %
  size: number; // px
  delay: number; // s
  duration: number; // s
  drift: number; // px horizontal drift
  rotate: number; // start rotation
  spin: number; // total spin
  fall: number; // px fall distance
}

function makePieces(count: number, viewportH: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    src: IMAGES[Math.floor(Math.random() * IMAGES.length)],
    left: Math.random() * 100,
    size: 18 + Math.random() * 30,
    delay: Math.random() * 0.7,
    duration: 2.8 + Math.random() * 2.2,
    drift: (Math.random() - 0.5) * 260,
    rotate: Math.random() * 360,
    spin: Math.random() * 720 - 360,
    fall: viewportH * 1.25,
  }));
}

/** One-shot confetti of the T-Mobile marks, raining down on first load. */
export function Confetti({ count = 80 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Preload + decode all three images first so the burst starts in sync
    // and animates smoothly instead of popping in as files arrive.
    Promise.all(
      IMAGES.map((src) => {
        const img = new window.Image();
        img.src = src;
        return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      }),
    ).then(() => {
      if (!cancelled) setPieces(makePieces(count, window.innerHeight));
    });

    const t = setTimeout(() => setDone(true), 8000); // unmount after the burst
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [count]);

  if (done) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.img
          key={p.id}
          src={p.src}
          alt=""
          className="absolute object-contain"
          style={{
            left: `${p.left}%`,
            top: "-12%",
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
          }}
          initial={{ y: 0, x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{
            y: p.fall,
            x: p.drift,
            rotate: p.rotate + p.spin,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            opacity: { duration: p.duration, delay: p.delay, times: [0, 0.06, 0.82, 1] },
          }}
        />
      ))}
    </div>
  );
}
