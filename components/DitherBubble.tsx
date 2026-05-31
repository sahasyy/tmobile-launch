"use client";

import { useEffect, useRef } from "react";
import type { CameraState, CameraMotion } from "@/hooks/useCamera";

// 8x8 ordered Bayer matrix, normalized 0..1
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
].map((v) => v / 63);

interface Props {
  stateRef: React.MutableRefObject<CameraState>;
  motionRef: React.MutableRefObject<CameraMotion>;
  ready: boolean;
}

/**
 * Renders the camera as a violet/magenta ordered-dither halftone.
 * When no camera is present, animates a procedural plasma instead.
 */
export function DitherBubble({ stateRef, motionRef, ready }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 256;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const img = ctx.createImageData(SIZE, SIZE);

    let raf = 0;
    let t = 0;

    const render = () => {
      t += 0.006;
      const { pixels, width, height } = stateRef.current;
      const { brightness } = motionRef.current;
      const sx = width / SIZE;
      const sy = height / SIZE;
      const thresh = brightness * 0.3 + 0.2;

      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const bayer = BAYER[(y & 7) * 8 + (x & 7)];
          let lum: number;

          if (pixels && ready) {
            // mirror horizontally so it reads like a mirror
            const px = ((SIZE - 1 - x) * sx) | 0;
            const py = (y * sy) | 0;
            const idx = (py * width + px) * 4;
            lum =
              (pixels[idx] * 0.299 +
                pixels[idx + 1] * 0.587 +
                pixels[idx + 2] * 0.114) /
              255;
          } else {
            lum =
              0.5 +
              0.4 * Math.sin(x * 0.05 + t * 2) * Math.cos(y * 0.045 + t);
          }

          const on = lum * (1 + thresh) > bayer;
          const i = (y * SIZE + x) * 4;
          if (on) {
            img.data[i] = 255;
            img.data[i + 1] = 77;
            img.data[i + 2] = 184;
          } else {
            img.data[i] = 82;
            img.data[i + 1] = 58;
            img.data[i + 2] = 232;
          }
          img.data[i + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [stateRef, motionRef, ready]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
