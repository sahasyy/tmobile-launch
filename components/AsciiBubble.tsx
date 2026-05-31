"use client";

import { useEffect, useRef } from "react";
import type { CameraState } from "@/hooks/useCamera";

const CHARS = " .·:;+*?%$#@█";
const COLS = 30;
const ROWS = 22;

interface Props {
  stateRef: React.MutableRefObject<CameraState>;
  ready: boolean;
}

/**
 * Renders the camera feed as live magenta ASCII characters.
 * Falls back to a procedural ASCII plasma when no camera is present.
 */
export function AsciiBubble({ stateRef, ready }: Props) {
  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    let raf = 0;
    let t = 0;

    const render = () => {
      t += 0.02;
      const { pixels, width, height } = stateRef.current;
      const lines: string[] = [];

      if (pixels && ready) {
        const sx = width / COLS;
        const sy = height / ROWS;
        for (let r = 0; r < ROWS; r++) {
          let line = "";
          for (let c = 0; c < COLS; c++) {
            const px = ((COLS - 1 - c) * sx) | 0; // mirror
            const py = (r * sy) | 0;
            const idx = (py * width + px) * 4;
            const l =
              (pixels[idx] * 0.299 +
                pixels[idx + 1] * 0.587 +
                pixels[idx + 2] * 0.114) /
              255;
            const ci = Math.min(
              CHARS.length - 1,
              Math.max(0, (l * (CHARS.length - 1)) | 0)
            );
            line += CHARS[ci];
          }
          lines.push(line);
        }
      } else {
        for (let r = 0; r < ROWS; r++) {
          let line = "";
          for (let c = 0; c < COLS; c++) {
            const v =
              0.5 +
              0.45 * Math.sin(c * 0.4 + t * 1.8) * Math.cos(r * 0.5 + t);
            const ci = Math.min(
              CHARS.length - 1,
              Math.max(0, (v * (CHARS.length - 1)) | 0)
            );
            line += CHARS[ci];
          }
          lines.push(line);
        }
      }

      pre.textContent = lines.join("\n");
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [stateRef, ready]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#ff5db8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(135deg,#ff5db8,#e20074)]" />
      {/* scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <pre
        ref={preRef}
        className="absolute inset-0 flex items-center justify-center whitespace-pre text-center font-mono leading-[1.05] text-white/82 mix-blend-screen"
        style={{ fontSize: "clamp(6px, 0.62vw, 10px)" }}
        aria-hidden="true"
      />
    </div>
  );
}
