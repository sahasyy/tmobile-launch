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

// Domain-warped pink/magenta aurora. Camera motion steers the flow direction
// and the soft core, brightness pumps the overall energy.
const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMotion;     // -1..1
uniform float uBright;     // 0..1

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int k=0;k<5;k++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  float r = length(uv);

  float tt = uTime * 0.18 + uMotion.x * 1.5;
  vec2 q = vec2(fbm(uv*1.6 + tt), fbm(uv*1.6 - tt + 4.0));
  vec2 warp = uv + q*0.6 + uMotion*0.25;
  float f = fbm(warp*2.0 + uTime*0.12);

  vec3 deep    = vec3(0.75, 0.02, 0.38);
  vec3 rose    = vec3(1.00, 0.36, 0.72);
  vec3 magenta = vec3(0.95, 0.12, 0.60);
  vec3 hot     = vec3(1.0, 0.72, 0.90);
  vec3 white   = vec3(1.0);

  vec3 col = mix(deep, rose, smoothstep(0.12, 0.58, f));
  col = mix(col, magenta, smoothstep(0.45, 0.85, f) * 0.55);
  col = mix(col, hot, smoothstep(0.55, 0.95, f) * (0.6 + uBright*0.6));

  // white core that drifts with motion
  vec2 core = uMotion * 0.3;
  float coreGlow = smoothstep(0.5, 0.0, length(uv - core));
  col = mix(col, white, coreGlow * 0.35);

  float vignette = smoothstep(1.35, 0.18, r);
  col = mix(vec3(0.98, 0.28, 0.66), col, vignette);
  gl_FragColor = vec4(col, 1.0);
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

export function GradientBubble({ motionRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const SIZE = 320;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMotion = gl.getUniformLocation(prog, "uMotion");
    const uBright = gl.getUniformLocation(prog, "uBright");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // smoothed motion for buttery transitions
    let smX = 0;
    let smY = 0;
    let smB = 0.5;
    const start = performance.now();
    let raf = 0;

    const render = () => {
      const m = motionRef.current;
      smX += (m.x - smX) * 0.06;
      smY += (m.y - smY) * 0.06;
      smB += (m.brightness - smB) * 0.06;

      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, SIZE, SIZE);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMotion, smX, -smY);
      gl.uniform1f(uBright, smB);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [motionRef]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
