# ML Intern @ T-Mobile - Hard Launch

A camera-reactive, single-page hero site announcing an ML Engineer internship at T-Mobile for Summer 2026.
Built with **Next.js 16 + TypeScript + Tailwind + Framer Motion + WebGL**.

Light canvas, T-Mobile magenta (`#E20074`) frame, three short copy panels, and a different
live effect in each panel powered by your webcam.
The outer hero frame uses a slow paper-grain shader with magenta, rose, blush-white, coral,
and a restrained mint complement.

## The three panels

| Panel | Effect | Tech |
|--------|--------|------|
| Big (left) | "I'm joining T-Mobile" over ordered **Bayer dithering** | Canvas 2D + 8×8 Bayer matrix |
| Top-right | "ML Eng" over an **aurora gradient swirl** that warps toward your motion | WebGL fragment shader (GLSL, domain-warped fBm) |
| Bottom-right | "Summer 2026" over live **ASCII art** camera feed with scanlines | Canvas luminance → character ramp |

The whole grid subtly parallaxes toward your face/cursor, and the magenta frame tracks your position.
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

All the visible announcement text lives in `components/PanelText.tsx` and `components/LaunchFrame.tsx`. The magenta accent is the
`text-magenta` class, defined in `tailwind.config.ts`.

## Project structure

```
app/
  layout.tsx        fonts (Bebas Neue + Space Mono) and metadata
  page.tsx          orchestrates camera loop, halo, layers
  globals.css       grain overlay and global background
components/
  LaunchFrame.tsx   framed 1-large + 2-stacked panel layout
  BorderGrainShader.tsx animated WebGL paper-grain frame
  DitherBubble.tsx  Bayer dither renderer
  GradientBubble.tsx WebGL aurora shader
  AsciiBubble.tsx   ASCII camera feed
  PanelText.tsx     Framer Motion panel copy reveal
hooks/
  useCamera.ts      getUserMedia + per-frame luminance/motion sampling
lib/
  utils.ts          cn() class helper
```

## Notes

- Built and type-checked against Next.js 16.2.6, React 19, strict TypeScript.
- Want real Aceternity components (Vortex, Meteors, Lamp)? Drop them into `components/ui/`.
  they're built on the same Framer Motion + Tailwind stack this project already uses.
