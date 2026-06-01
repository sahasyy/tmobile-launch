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
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.52;
  }
  return value;
}

float blob(vec2 uv, vec2 center, vec2 scale) {
  vec2 q = (uv - center) / scale;
  return exp(-dot(q, q));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.055;

  vec2 drift = vec2(sin(t) * 0.035, cos(t * 0.8) * 0.025);
  float paper = fbm(p * 3.0 + drift);
  float fiber = fbm(vec2(p.x * 18.0 - t * 0.25, p.y * 8.0 + t * 0.16));
  float grain = hash(gl_FragCoord.xy + floor(uTime * 2.0));

  // Pink hues: blush base with soft rose and pink-petal blobs, a restrained magenta touch.
  vec3 base = vec3(0.988, 0.965, 0.975);
  vec3 petal = vec3(0.985, 0.800, 0.885);
  vec3 powder = vec3(0.965, 0.855, 0.910);
  vec3 rose = vec3(0.965, 0.470, 0.735);
  vec3 magenta = vec3(0.886, 0.000, 0.455);
  vec3 blush = vec3(0.975, 0.720, 0.840);

  float b1 = blob(uv, vec2(0.72 + sin(t * 1.2) * 0.04, 0.72), vec2(0.55, 0.42));
  float b2 = blob(uv, vec2(0.24, 0.22 + cos(t) * 0.04), vec2(0.52, 0.38));
  float b3 = blob(uv, vec2(0.82, 0.22), vec2(0.36, 0.46));
  float b4 = blob(uv, vec2(0.44, 0.48), vec2(0.58, 0.42));

  vec3 color = base;
  color = mix(color, powder, b1 * 0.50);
  color = mix(color, petal, b1 * 0.34);
  color = mix(color, rose, b2 * 0.46);
  color = mix(color, magenta, b3 * 0.10);
  color = mix(color, blush, b4 * 0.38);

  color = mix(color, vec3(1.0), smoothstep(0.78, 1.0, uv.x + uv.y) * 0.16);
  color += (paper - 0.5) * 0.035;
  color += (fiber - 0.5) * 0.022;
  color += (grain - 0.5) * 0.055;

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

export function PanelGrainGradientShader() {
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
