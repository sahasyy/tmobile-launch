"use client";

import { useEffect, useRef } from "react";

/**
 * Soft cloud-like glowing orb for the intro: white base with billowing pink /
 * blush / magenta clouds and fine grain. Rendered into a square canvas; the
 * parent scales + rotates it. The shader itself slowly churns so the cloud
 * feels alive even before it grows.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<6;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 c = uv - 0.5;
  float r = length(c);
  float t = uTime * 0.12;

  // Domain-warped fbm -> billowing cloud
  vec2 q = vec2(fbm(c*2.6 + vec2(t, -t*0.7)), fbm(c*2.6 + vec2(4.3, 1.7) - t*0.5));
  float cloud = fbm(c*3.2 + q*1.6 + vec2(-t*0.4, t*0.3));
  cloud = cloud*0.5 + 0.5;

  // Brand cloud palette
  vec3 white  = vec3(1.000, 0.992, 0.996);
  vec3 blush  = vec3(1.000, 0.870, 0.930);
  vec3 pink   = vec3(0.985, 0.620, 0.800);
  vec3 magenta= vec3(0.886, 0.000, 0.455);

  // Layered tints driven by the cloud field — richer, more colourful clouds
  vec3 col = blush;
  col = mix(col, pink,  smoothstep(0.28, 0.74, cloud) * 0.92);
  col = mix(col, magenta, smoothstep(0.52, 0.95, cloud) * 0.78 * (0.55 + 0.45*q.x));
  // Bright blush highlights where the cloud thins
  col = mix(col, blush, smoothstep(0.62, 0.18, cloud) * 0.5);

  // Soft round glow falloff toward the edges (so it reads as an orb/cloud)
  float glow = smoothstep(0.66, 0.10, r);
  // bright drifting hotspot — keeps a luminous core without washing it all white
  vec2 hot = vec2(0.05*sin(t*1.3), 0.04*cos(t));
  float bloom = smoothstep(0.34, 0.0, length(c - hot));
  // edge fades to white page; interior keeps its colour
  col = mix(white, col, glow);
  col = mix(col, mix(white, blush, 0.5), bloom * 0.55);

  // Fine grain (the "noise" texture)
  float g = hash(gl_FragCoord.xy + floor(uTime*9.0));
  col += (g - 0.5) * 0.06;
  float g2 = noise(uv * 220.0 + t*7.0);
  col += (g2 - 0.5) * 0.04;

  // Alpha: fully opaque in the cloud body, feathering to transparent at the rim
  float alpha = smoothstep(0.5, 0.16, r);
  alpha = clamp(alpha + glow * 0.15, 0.0, 1.0);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
  }
  return sh;
}

export function IntroCloudShader({ className = "" }: { className?: string }) {
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

    const program = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
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
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
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
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={className} aria-hidden="true" />
  );
}
