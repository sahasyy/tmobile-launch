"use client";

import { GrainGradient } from "@paper-design/shaders-react";

type GrainGradientShape =
  | "wave"
  | "dots"
  | "truchet"
  | "corners"
  | "ripple"
  | "blob"
  | "sphere";

interface GradientBackgroundProps {
  className?: string;
  colors?: string[];
  colorBack?: string;
  shape?: GrainGradientShape;
  softness?: number;
  intensity?: number;
  noise?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  speed?: number;
  /** Cap on rendered pixels — keeps WebGL cheap on high-DPR phones. */
  maxPixelCount?: number;
}

export function GradientBackground({
  className = "absolute inset-0 -z-10",
  colors = [
    "hsl(14, 100%, 57%)",
    "hsl(45, 100%, 51%)",
    "hsl(340, 82%, 52%)",
  ],
  colorBack = "hsl(0, 0%, 0%)",
  shape = "corners",
  softness = 0.76,
  intensity = 0.45,
  noise = 0,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
  speed = 1,
  // Cap rendered resolution so 4 shaders stay smooth on high-DPR phones.
  // Grain hides the slight softening; desktop is barely affected.
  maxPixelCount = 1_280_000,
}: GradientBackgroundProps) {
  return (
    <div className={className}>
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        maxPixelCount={maxPixelCount}
        colorBack={colorBack}
        softness={softness}
        intensity={intensity}
        noise={noise}
        shape={shape}
        offsetX={offsetX}
        offsetY={offsetY}
        scale={scale}
        rotation={rotation}
        speed={speed}
        colors={colors}
      />
    </div>
  );
}
