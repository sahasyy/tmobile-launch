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
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=erode@300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
