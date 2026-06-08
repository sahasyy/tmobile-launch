"use client";

import { useEffect, useRef } from "react";

const IMAGES = ["/tmobile.png", "/tmobile1.png", "/tmobile2.png"];
const ASPECT = 888 / 800; // source image height / width

interface Piece {
  img: HTMLImageElement;
  x: number; // start x (px)
  drift: number; // horizontal drift (px)
  size: number; // px (width)
  delay: number; // s
  duration: number; // s
  angle: number; // start rotation (rad)
  spin: number; // total spin (rad)
}

const easeIn = (t: number) => t * t; // gentle acceleration as they fall

/**
 * One-shot confetti of the T-Mobile marks, drawn on a single canvas with
 * requestAnimationFrame so dozens of pieces stay smooth on mobile (one
 * composited layer instead of one DOM node + GPU layer per piece).
 */
export function Confetti({ count = 90 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    let pieces: Piece[] = [];
    let start = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };

    const build = (imgs: HTMLImageElement[]) => {
      const w = window.innerWidth;
      const n = w < 768 ? Math.min(count, 55) : count;
      pieces = Array.from({ length: n }, () => ({
        img: imgs[(Math.random() * imgs.length) | 0],
        x: Math.random() * w,
        drift: (Math.random() - 0.5) * 220,
        size: 16 + Math.random() * 28,
        delay: Math.random() * 0.8,
        duration: 2.8 + Math.random() * 2.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * Math.PI * 6,
      }));
    };

    const frame = (now: number) => {
      if (stopped) return;
      if (!start) start = now;
      const t = (now - start) / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      let alive = false;
      for (const p of pieces) {
        const local = t - p.delay;
        if (local < 0) {
          alive = true;
          continue;
        }
        const prog = local / p.duration;
        if (prog >= 1) continue;
        alive = true;

        const y = -p.size + easeIn(prog) * (h + p.size * 2);
        const x = p.x + p.drift * prog;
        const angle = p.angle + p.spin * prog;
        const alpha =
          prog < 0.06 ? prog / 0.06 : prog > 0.82 ? Math.max(0, 1 - (prog - 0.82) / 0.18) : 1;
        const hgt = p.size * ASPECT;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;
        ctx.drawImage(p.img, -p.size / 2, -hgt / 2, p.size, hgt);
        ctx.restore();
      }
      ctx.restore();

      if (alive) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);

    Promise.all(
      IMAGES.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            img.src = src;
          }),
      ),
    ).then((imgs) => {
      if (stopped) return;
      build(imgs);
      raf = requestAnimationFrame(frame);
    });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
}
