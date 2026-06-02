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

  // --- Moving specular sheen (the liquid-chrome glint) ---
  float band = p.x * 0.9 + p.y * 0.6;
  float sheenCoord = band * 3.0 + (flow - 0.5) * 2.6 - uPhase;
  float sheen = pow(0.5 + 0.5 * sin(sheenCoord), 6.0);
  float sheen2 = pow(0.5 + 0.5 * sin(band * 1.7 - flow * 1.8 - uPhase * 0.6), 10.0);
  float spec = clamp(sheen * 0.8 + sheen2 * 0.6, 0.0, 1.0);

  // --- Palette: white-dominant, light pink flowing, magenta filament only ---
  vec3 white   = vec3(0.985, 0.980, 0.985);
  vec3 silver  = vec3(0.945, 0.930, 0.945);
  vec3 ltPink  = vec3(0.995, 0.870, 0.930);
  vec3 pinkMid = vec3(0.985, 0.640, 0.820);
  vec3 magenta = vec3(0.886, 0.000, 0.455);
  vec3 hi      = vec3(1.000, 0.995, 1.000);

  vec3 col = mix(white, silver, smoothstep(0.35, 0.75, flow) * 0.45);
  col = mix(col, ltPink, smoothstep(0.30, 0.85, flow) * 0.55);
  col = mix(col, pinkMid, smoothstep(0.55, 0.95, flow + spec * 0.3) * 0.30);

  // thin magenta filament riding the sheen crest
  float filament = smoothstep(0.82, 0.97, spec) * smoothstep(0.45, 0.80, flow);
  col = mix(col, magenta, filament * 0.35);

  // specular highlight last -> bright white core with magenta on its flanks
  col = mix(col, hi, spec * 0.55);

  // --- Grain (matched to the GrainGradient feel; cleaner in highlights) ---
  float fineGrain = hash(gl_FragCoord.xy + vec2(floor(t * 3.0)));
  float softSpeckle = noise(p * 140.0);
  float grain = (fineGrain - 0.5) * 0.055 + (softSpeckle - 0.5) * 0.040;
  col += grain * (1.0 - spec * 0.5);

  // subtle all-around vignette
  float edge = smoothstep(0.0, 0.5, uv.y) * smoothstep(1.0, 0.5, uv.y);
  col *= 0.97 + edge * 0.05;

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

export function BorderGrainShader({
  onPhase,
}: {
  /** Called each frame with the sheen's current rotation angle (deg), derived
   *  from the same clock as the shader so a highlight ring can stay synced. */
  onPhase?: (angleDeg: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;

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
      const phase = t * SHEEN_SPEED;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uPhase, phase);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Report a rotation angle from the same clock so the ring stays locked.
      if (onPhaseRef.current) {
        onPhaseRef.current(((phase * 180) / Math.PI) % 360);
      }
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
