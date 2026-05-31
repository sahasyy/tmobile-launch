"use client";

import { useEffect, useRef } from "react";
import type { CameraMotion } from "@/hooks/useCamera";

interface Props {
  motionRef: React.MutableRefObject<CameraMotion>;
}

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
uniform vec2 uMotion;
uniform float uBright;

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

  vec2 drift = vec2(uTime * 0.018, -uTime * 0.012) + uMotion * 0.035;
  float cloud = fbm(p * 2.1 + drift);
  float fiber = fbm(vec2(p.x * 9.5 + uTime * 0.025, p.y * 36.0 - uTime * 0.018));
  float softSpeckle = noise(p * 145.0 + drift * 7.0);
  float fineGrain = hash(gl_FragCoord.xy + vec2(floor(uTime * 3.0)));

  vec3 tmo = vec3(0.886, 0.000, 0.455);
  vec3 rose = vec3(1.000, 0.340, 0.730);
  vec3 blush = vec3(1.000, 0.775, 0.900);
  vec3 paper = vec3(1.000, 0.955, 0.985);
  vec3 coral = vec3(1.000, 0.520, 0.640);
  vec3 mint = vec3(0.805, 0.945, 0.905);

  vec3 col = mix(tmo, rose, smoothstep(0.18, 0.86, cloud) * 0.72);
  col = mix(col, coral, smoothstep(0.38, 0.82, fiber) * 0.12);
  col = mix(col, blush, smoothstep(0.64, 0.96, cloud + fiber * 0.45) * 0.22);
  col = mix(col, paper, smoothstep(0.82, 1.00, fiber) * 0.18);
  col = mix(col, mint, smoothstep(0.90, 1.00, softSpeckle) * 0.055);

  float grain = (fineGrain - 0.5) * 0.085 + (softSpeckle - 0.5) * 0.055;
  col += grain * (0.92 + uBright * 0.18);

  float edgeShade = smoothstep(0.0, 0.55, uv.y) * smoothstep(1.0, 0.45, uv.y);
  col *= 0.95 + edgeShade * 0.08;

  gl_FragColor = vec4(col, 1.0);
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

export function BorderGrainShader({ motionRef }: Props) {
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
    const uMotion = gl.getUniformLocation(program, "uMotion");
    const uBright = gl.getUniformLocation(program, "uBright");

    let smX = 0;
    let smY = 0;
    let smB = 0.5;
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

    const render = () => {
      const motion = motionRef.current;
      smX += (motion.x - smX) * 0.045;
      smY += (motion.y - smY) * 0.045;
      smB += (motion.brightness - smB) * 0.045;

      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMotion, smX, -smY);
      gl.uniform1f(uBright, smB);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, [motionRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
