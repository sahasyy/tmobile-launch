import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ML Intern @ T-Mobile",
  description:
    "I'm joining T-Mobile as an ML Engineer in Summer 2026. A camera-reactive hard launch.",
  openGraph: {
    title: "ML Intern @ T-Mobile",
    description: "I'm joining T-Mobile as an ML Engineer in Summer 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=erode@300&display=swap"
          rel="stylesheet"
        />
        {/* Onboarding gate: set data-intro="play" before first paint for
            first-time visitors (respecting reduced-motion). No flash, no
            hydration impact — only mutates the <html> dataset. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!localStorage.getItem('tmo-intro-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='play';}}catch(e){}`,
          }}
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
