"use client";

import { useEffect, useRef } from "react";

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
    p *= 2.04;
    a *= 0.52;
  }
  return v;
}

float ribbon(vec2 uv, float offset, float slope, float width, float phase) {
  float curve = offset + slope * uv.x + 0.105 * sin(uv.x * 4.2 + phase);
  float d = abs(uv.y - curve);
  return exp(-(d * d) / width);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.42;

  float warp = fbm(p * 2.8 + vec2(t * 0.10, -t * 0.07));
  vec2 wuv = uv + vec2((warp - 0.5) * 0.045, (warp - 0.5) * 0.032);

  float broadA = ribbon(wuv, 0.05 + 0.06 * sin(t * 0.33), 0.78, 0.018, t);
  float broadB = ribbon(wuv, 0.94 + 0.05 * cos(t * 0.27), -0.92, 0.030, -t * 0.72);
  float sharp = ribbon(wuv, 0.18 + 0.05 * sin(t * 0.2), 0.72, 0.0028, t * 1.45);
  float vertical = exp(-pow((wuv.x - (0.52 + 0.08 * sin(t * 0.21))) / 0.13, 2.0));

  float beams = clamp(broadA * 0.95 + broadB * 0.82 + sharp * 1.6 + vertical * 0.38, 0.0, 1.0);
  float powder = fbm(p * 11.0 + vec2(-t * 0.35, t * 0.18));
  float sand = hash(gl_FragCoord.xy + floor(uTime * 9.0));
  float sandMask = smoothstep(0.08, 0.86, beams + powder * 0.26);

  vec3 blue = vec3(0.000, 0.055, 0.980);
  vec3 cobalt = vec3(0.000, 0.190, 1.000);
  vec3 ice = vec3(0.780, 0.950, 1.000);
  vec3 white = vec3(1.000);

  vec3 color = mix(blue, cobalt, smoothstep(0.05, 0.95, warp) * 0.28);
  color = mix(color, ice, beams * 0.62);
  color = mix(color, white, smoothstep(0.44, 0.98, beams) * 0.72);

  float speckles = (sand - 0.5) * (0.18 + sandMask * 0.55);
  color += speckles;

  float whiteDust = step(0.76, sand) * sandMask * 0.42;
  color = mix(color, white, whiteDust);

  float shade = smoothstep(0.0, 0.55, uv.x) * smoothstep(1.0, 0.52, uv.y);
  color *= 0.90 + shade * 0.16;
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function SandBeamShader() {
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
    const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
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
    const start = performance.now();
    let raf = 0;

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
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <>
      <div className="sand-beam-fallback absolute inset-0" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </>
  );
}
