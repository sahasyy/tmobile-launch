# ML Intern @ T-Mobile - Hard Launch

A camera-reactive, single-page hero site announcing an ML Engineer internship at T-Mobile.
Built with **Next.js 16 + TypeScript + Tailwind + Framer Motion + WebGL**, with Aceternity-style
Aurora and Spotlight effects.

White minimalist canvas, T-Mobile magenta (`#E20074`), one confident line of copy, and three
floating bubbles, each a different live effect powered by your webcam.

## The three bubbles

| Bubble | Effect | Tech |
|--------|--------|------|
| Big (left) | Ordered **Bayer dithering** halftone of the camera, in magenta/white | Canvas 2D + 8×8 Bayer matrix |
| Small (top-right) | **Aurora gradient swirl** that warps toward your motion | WebGL fragment shader (GLSL, domain-warped fBm) |
| Small (bottom-right) | Live **ASCII art** camera feed with scanlines | Canvas luminance → character ramp |

The whole cluster parallaxes toward your face/cursor, and a magenta edge halo tracks your position.
No camera? Everything falls back to procedural animation automatically. **No video ever leaves the
browser. Nothing is uploaded or stored.**

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and allow camera access when prompted.

## Deploy (free, ~30 seconds)

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), click **Add New → Project**, import the repo.
3. Click **Deploy**. Done: you get a live `https://your-project.vercel.app` URL.

> Camera APIs require HTTPS. Vercel serves HTTPS by default, so the camera works on the deployed
> site. (On localhost it works too, since `localhost` is treated as secure.)

## Editing the copy

All the visible announcement text lives in `components/HeroText.tsx`. The magenta accent is the
`text-magenta` class, defined in `tailwind.config.ts`.

## Project structure

```
app/
  layout.tsx        fonts (Bebas Neue + Space Mono) and metadata
  page.tsx          orchestrates camera loop, halo, layers
  globals.css       grain overlay, spotlight keyframe
components/
  Bubbles.tsx       layout + parallax for the three bubbles
  DitherBubble.tsx  Bayer dither renderer
  GradientBubble.tsx WebGL aurora shader
  AsciiBubble.tsx   ASCII camera feed
  HeroText.tsx      Framer Motion staggered reveal
  ui/
    aurora-background.tsx   Aceternity-style aurora
    spotlight.tsx           Aceternity-style spotlight
hooks/
  useCamera.ts      getUserMedia + per-frame luminance/motion sampling
lib/
  utils.ts          cn() class helper
```

## Notes

- Built and type-checked against Next.js 16.2.6, React 19, strict TypeScript.
- Want real Aceternity components (Vortex, Meteors, Lamp)? Drop them into `components/ui/`.
  they're built on the same Framer Motion + Tailwind stack this project already uses.
