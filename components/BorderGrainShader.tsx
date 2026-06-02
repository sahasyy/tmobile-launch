"use client";

import { useEffect, useRef } from "react";

// Shared sweep speed. The shader advances its specular sheen by `uPhase` and the
// JS reports a rotation angle derived from the SAME clock+speed, so the bubble
// highlight ring stays locked to the sheen (no drift, no GPU readback).
const SHEEN_SPEED = 0.5; // radians/sec of sheen phase

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uPhase;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.52;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  // --- Liquid base: domain-warped fbm (flowing, marbled metal body) ---
  vec2 q = vec2(
    fbm(p * 1.6 + vec2(0.0, t * 0.05)),
    fbm(p * 1.6 + vec2(5.2, -t * 0.04))
  );
  vec2 r = vec2(
    fbm(p * 1.6 + 3.0 * q + vec2(1.7, t * 0.07)),
    fbm(p * 1.6 + 3.0 * q + vec2(8.3, -t * 0.06))
  );
  float flow = fbm(p * 1.9 + 2.4 * r);

  // --- Pronounced liquid sheen sweeping across (the chrome highlight) ---
  // Diagonal sweep coordinate, rippled by the flow so the band is wavy not straight.
  float band = p.x * 0.85 + p.y * 0.6 + (flow - 0.5) * 1.3;
  // Two traveling waves at different speeds for a layered metallic shimmer.
  float w1 = sin(band * 6.2831 - uPhase * 1.6);
  float w2 = sin(band * 12.566 - uPhase * 2.4 + flow * 3.0);

  // Broad pink tint mass riding the slow wave (the colored body of the liquid).
  float pinkMass = clamp(0.45 + 0.55 * w1 + (flow - 0.5) * 0.7, 0.0, 1.0);

  // Sharp bright sheen crests (narrow, high-contrast — reads as moving chrome).
  float crest1 = pow(max(0.0, w1), 3.0);
  float crest2 = pow(max(0.0, w2), 8.0);
  float spec = clamp(crest1 * 0.85 + crest2 * 0.6, 0.0, 1.0);

  // --- Palette: luminous white/light-pink, rich pink flow, magenta accent ---
  vec3 paper   = vec3(1.000, 0.972, 0.984); // near-white base
  vec3 ltPink  = vec3(1.000, 0.815, 0.900); // light pink
  vec3 pink    = vec3(0.980, 0.520, 0.755); // mid pink (the flow)
  vec3 deep    = vec3(0.915, 0.230, 0.600); // deep pink (wave troughs)
  vec3 magenta = vec3(0.886, 0.000, 0.455); // #E20074 accent
  vec3 hi      = vec3(1.000, 0.999, 1.000); // specular white

  // Base white -> light pink -> rich pink bands that clearly flow through.
  vec3 col = mix(paper, ltPink, smoothstep(0.10, 0.6, flow));
  col = mix(col, pink, smoothstep(0.32, 0.82, pinkMass) * 0.85);
  col = mix(col, deep, smoothstep(0.60, 0.95, pinkMass) * 0.6);

  // Bold magenta filament riding the sharp sheen crest (visible thin accent).
  float filament = crest2 * smoothstep(0.4, 0.8, pinkMass);
  col = mix(col, magenta, filament * 0.6);

  // Specular sheen last — a bright luminous glint that clearly sweeps across.
  col = mix(col, hi, spec * 0.8);

  // --- Grain (GrainGradient feel; cleaner in the bright sheen) ---
  float fineGrain = hash(gl_FragCoord.xy + vec2(floor(t * 3.0)));
  float softSpeckle = noise(p * 140.0);
  float grain = (fineGrain - 0.5) * 0.07 + (softSpeckle - 0.5) * 0.05;
  col += grain * (1.0 - spec * 0.5);

  // subtle all-around vignette
  float edge = smoothstep(0.0, 0.5, uv.y) * smoothstep(1.0, 0.5, uv.y);
  col *= 0.96 + edge * 0.06;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function BorderGrainShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const program = gl.createProgram()!;
    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPhase = gl.getUniformLocation(program, "uPhase");

    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (t: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uPhase, t * SHEEN_SPEED);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    if (reduced) {
      // Static still — render one frame, no animation loop.
      draw(8);
    } else {
      const render = () => {
        draw((performance.now() - start) / 1000);
        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
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
