"use client";

import { useEffect, useRef } from "react";

/**
 * White border with a subtle T-Mobile magenta glow that slowly orbits the
 * perimeter clockwise. The border reads as pure white most of the time;
 * magenta only appears as the glow sweeps through each section.
 *
 * Architecture: fills the full border-band div. The opaque white bubble
 * (next sibling) covers the center, so the animation is naturally isolated
 * to the perimeter strip.
 */

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;

  // --- Aspect-correct pixel coords (0..1 both axes, 0 = bottom-left) ---
  // uv.y is already 0-bottom in WebGL fragCoord, but we want 0 = top for
  // the clockwise orbit, so we flip y.
  float x = uv.x;
  float y = 1.0 - uv.y;   // 0 = top, 1 = bottom

  // --- Band mask: how close is this pixel to the border perimeter? ---
  // The band is the min distance to any of the 4 edges in UV space.
  // bandBandwidth controls what fraction of the canvas width = one band side.
  // At 1440px with ~18px band, that's ~0.0125; we use a generous 0.035 so the
  // glow has room to feather nicely and looks good across all screen sizes.
  float bw = 0.035;

  float distToEdge = min(min(x, 1.0 - x), min(y, 1.0 - y));
  // 1 = right at the outer edge; 0 = well inside the white bubble area
  float bandMask = smoothstep(bw, 0.0, distToEdge);

  // Early discard of center pixels (saves fill-rate, not strictly needed)
  if (bandMask < 0.001) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
    return;
  }

  // --- Perimeter scalar t ∈ [0, 1) going CLOCKWISE from top-left ---
  // We unwrap the 4 sides linearly. Aspect ratio matters: a wide canvas has
  // longer top/bottom sides than left/right.
  float aspect = uRes.x / uRes.y;     // e.g. 1.6 for 1440x900
  float horiz = aspect;               // relative length of top/bottom
  float vert  = 1.0;                  // relative length of left/right
  float perim = 2.0 * (horiz + vert); // total perimeter length in these units

  // Which quadrant? Determine by proximity to each edge.
  // We snap each pixel to its nearest edge and compute t along that edge.
  float dTop    = y;
  float dRight  = 1.0 - x;
  float dBottom = 1.0 - y;
  float dLeft   = x;
  float dMin    = min(min(dTop, dRight), min(dBottom, dLeft));

  float t;
  if (dMin == dTop) {
    // Top edge: x goes 0→1, clockwise = left to right
    t = x * horiz / perim;
  } else if (dMin == dRight) {
    // Right edge: y goes 0→1 (top→bottom), clockwise
    t = (horiz + y * vert) / perim;
  } else if (dMin == dBottom) {
    // Bottom edge: x goes 1→0 (right to left), clockwise
    t = (horiz + vert + (1.0 - x) * horiz) / perim;
  } else {
    // Left edge: y goes 1→0 (bottom→top), clockwise
    t = (2.0 * horiz + vert + (1.0 - y) * vert) / perim;
  }

  // --- Orbiting glow ---
  // One full orbit every ~25 seconds. SPEED = 1/period.
  float SPEED = 0.04;
  float phase = fract(uTime * SPEED);

  // Wrapped distance in perimeter space (0..1)
  float dt = fract(t - phase + 1.0);
  // Make it symmetric: dt close to 0 = glow center, dt close to 1 also wraps
  float dtSym = min(dt, 1.0 - dt); // 0 at center, 0.5 at opposite side

  // Gaussian falloff — SIGMA controls glow width (0.06 = soft ~60° arc)
  float SIGMA = 0.055;
  float glow = exp(-dtSym * dtSym / (2.0 * SIGMA * SIGMA));

  // --- Color ---
  vec3 white   = vec3(1.000, 1.000, 1.000);
  vec3 magenta = vec3(0.886, 0.000, 0.455); // T-Mobile #E20074
  vec3 blush   = vec3(1.000, 0.880, 0.940); // very light tint between white/magenta

  // Base is pure white; blush appears just before the magenta peak; magenta peaks
  float blushAmt   = smoothstep(0.0, 0.35, glow) * 0.45;
  float magentaAmt = smoothstep(0.28, 1.0, glow) * 0.55;
  vec3 col = mix(white, blush,   blushAmt);
  col      = mix(col,   magenta, magentaAmt);

  // --- Fine grain (light, matches panel texture) ---
  float grain = (hash(gl_FragCoord.xy + floor(uTime * 8.0)) - 0.5) * 0.04;
  col = clamp(col + grain, 0.0, 1.0);

  // --- Alpha: opaque at the outer edge, fading toward the inner edge ---
  // This makes the inner seam feather into the white bubble naturally.
  float outerFade = smoothstep(0.0, bw * 0.3, distToEdge);    // fade at outer edge corners
  float innerFade = 1.0 - smoothstep(bw * 0.25, bw, distToEdge); // fade inward
  float alpha = clamp(innerFade - outerFade * 0.1, 0.0, 1.0);
  // The glow itself slightly boosts opacity at its peak so you see it clearly
  alpha = clamp(alpha + glow * 0.08, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("BorderOrbitShader compile error:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

export function BorderOrbitShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const prog = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Enable alpha blending so the canvas blends over the bg-white fallback
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const start = performance.now();
    let raf = 0;

    const draw = (t: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      draw(0);
    } else {
      const frame = () => {
        draw((performance.now() - start) / 1000);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
