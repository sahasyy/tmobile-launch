import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "I'm joining T-Mobile as an ML Engineer, Summer 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public", "tmobile-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const logoW = 640;
  const logoH = Math.round((logoW * 720) / 3561);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #e20074 0%, #b5005d 48%, #5a002f 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 56, opacity: 0.96, letterSpacing: -1, marginBottom: 14 }}>
          I&rsquo;m joining
        </div>
        <img src={logoSrc} width={logoW} height={logoH} alt="" />
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            opacity: 0.92,
            marginTop: 30,
            letterSpacing: -0.5,
          }}
        >
          as an ML Engineer · Summer 2026
        </div>
      </div>
    ),
    { ...size },
  );
}
