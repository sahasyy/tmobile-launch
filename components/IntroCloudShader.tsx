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
  float t = uTime * 0.14;

  // --- Slowly rotate the whole sampling space so the cloud spins ---
  float spin = uTime * 0.16;
  float cs = cos(spin), sn = sin(spin);
  vec2 cr = mat2(cs, -sn, sn, cs) * c;

  float r = length(cr);
  float ang = atan(cr.y, cr.x);

  // --- Domain-warped fbm field (the cloud body), advected over time so the
  //     internal structure churns and drifts as it rotates ---
  vec2 q = vec2(
    fbm(cr * 2.6 + vec2(t * 1.1, -t * 0.7)),
    fbm(cr * 2.6 + vec2(4.3, 1.7) - t * 0.5)
  );
  float cloud = fbm(cr * 3.2 + q * 1.7 + vec2(-t * 0.5, t * 0.35));
  cloud = cloud * 0.5 + 0.5;

  // --- Irregular cloud DENSITY field: combine the body field, the hue drift
  //     and angular lobes into one mass that is dense (magenta) in organic
  //     pockets and light (blush/white) elsewhere. The shape is read from this
  //     density, and because everything is advected + rotated, the masses
  //     churn and the silhouette morphs as it turns. ---
  float lobes =
      0.5 * fbm(vec2(ang * 1.6 + spin, t * 0.9))
    + 0.5 * fbm(vec2(cos(ang) * 2.4, sin(ang) * 2.4) + t * 0.8 + q * 1.3);

  float hueField = fbm(cr * 2.9 + vec2(t * 0.9, -t * 1.2) + q * 1.1);
  hueField = hueField * 0.5 + 0.5;

  // density: high = deep cloud (magenta), low = airy (blush/white). Keep plenty
  // of MID-RANGE variation so the cloud has visible pink billows + white wisps
  // (not a flat magenta blob).
  float density = cloud * 0.62 + hueField * 0.5 + (lobes - 0.5) * 0.34;
  // wobbly radial bias -> irregular silhouette
  float falloff = smoothstep(0.92 + 0.16 * (lobes * 2.0 - 1.0), 0.04, r);
  density = clamp(density * (0.6 + 0.6 * falloff), 0.0, 1.0);
  density = smoothstep(0.16, 0.96, density);   // wide range -> tonal variety

  // Secondary detail field for inner billows / wisps
  float billow = fbm(cr * 5.2 + vec2(-t * 0.8, t * 0.6) + q * 1.5);

  // Brand cloud palette (saturated)
  vec3 white  = vec3(1.000, 0.992, 0.996);
  vec3 blush  = vec3(1.000, 0.760, 0.880);
  vec3 pink   = vec3(0.962, 0.300, 0.640);
  vec3 magenta= vec3(0.886, 0.000, 0.455);

  // Opaque, full-bleed cloud: white wisps -> blush -> pink -> magenta pockets.
  vec3 col = mix(white, blush, smoothstep(0.0, 0.32, density));
  col = mix(col, pink, smoothstep(0.26, 0.66, density));
  col = mix(col, magenta, smoothstep(0.56, 0.95, density) * (0.85 + 0.15 * q.x));

  // Inner billows: lift lighter pink/white into the magenta so it reads cloudy
  col = mix(col, mix(pink, white, 0.5), smoothstep(0.55, 0.95, billow) * 0.35 * density);
  // soft dark magenta creases where billow dips
  col = mix(col, magenta, smoothstep(0.45, 0.05, billow) * 0.25 * density);

  // Drifting luminous highlight
  vec2 hot = vec2(0.14 * sin(t * 1.1), 0.1 * cos(t));
  float bloom = smoothstep(0.34, 0.0, length(cr - hot));
  col = mix(col, white, bloom * 0.4 * (1.0 - density * 0.6));

  // Fine grain (the "noise" texture)
  float g = hash(gl_FragCoord.xy + floor(uTime * 9.0));
  col += (g - 0.5) * 0.055;
  float g2 = noise(uv * 220.0 + t * 7.0);
  col += (g2 - 0.5) * 0.04;

  // Soft round alpha vignette: opaque cloud across the body, fading to
  // transparent only near the corners so there is NO hard square edge while
  // the canvas is small over the white screen.
  float alpha = smoothstep(0.72, 0.4, r);

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
