# ML Intern @ T-Mobile - Hard Launch

A single-page hero site announcing an ML Engineer internship at T-Mobile for Summer 2026.
Built with **Next.js 16 + TypeScript + Tailwind + Framer Motion + WebGL**.

Light canvas, T-Mobile magenta (`#E20074`) outer frame, a thick rounded white inner frame, and
three clean purple panels using the Erode typeface. The outer hero frame uses a slow paper-grain
shader with magenta, rose, blush-white, coral, and a restrained mint complement.

## The Three Panels

| Panel | Copy | Surface |
|--------|------|---------|
| Big left | "I'm joining T-Mobile" | Erode + animated blue sand-beam shader |
| Top right | "As a ML Engineer" | Erode + WebGL grain-gradient panel |
| Bottom right | "for Summer 2026" | Erode + flat purple panel |

The magenta frame keeps the subtle shader motion; the panels stay clean and stable.

## Run Locally

```bash
npm install
npm run dev
```

Keep that terminal running, then open http://localhost:3000.

`npm run build` only checks that the production bundle compiles. It does not start a server by
itself. For a production-style local preview, run:

```bash
npm run preview
```

## Deploy

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), click **Add New -> Project**, import the repo.
3. Click **Deploy**.

## Editing The Copy

The visible announcement text lives in `components/LaunchFrame.tsx`. The reusable text styling
lives in `components/PanelText.tsx`.

## Project Structure

```text
app/
  layout.tsx        Erode font link and metadata
  page.tsx          app shell
  globals.css       grain overlay and global background
components/
  LaunchFrame.tsx   framed 1-large + 2-stacked panel layout
  BorderGrainShader.tsx animated WebGL paper-grain frame
  PanelGrainGradientShader.tsx soft WebGL grain-gradient panel
  SandBeamShader.tsx blue WebGL sand-beam panel shader
  PanelText.tsx     Framer Motion panel copy reveal
```

## Notes

- Built and type-checked against Next.js 16.2.6, React 19, strict TypeScript.
