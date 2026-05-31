"use client";

import { cn } from "@/lib/utils";

/**
 * Aceternity-style aurora background, retuned for T-Mobile magenta on white.
 * Pure CSS gradient animation — no JS, GPU-composited.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute -inset-[10px] opacity-50 blur-[10px] will-change-transform animate-aurora"
        style={{
          backgroundImage: `
            repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
            repeating-linear-gradient(100deg, #E20074 10%, #FF1A8C 15%, #FF99CF 20%, #FFCCE7 25%, #E20074 30%)
          `,
          backgroundSize: "300%, 200%",
          backgroundPosition: "50% 50%, 50% 50%",
          maskImage:
            "radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)",
        }}
      />
    </div>
  );
}
