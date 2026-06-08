import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tmobile.sahassharma.com"),
  title: "ML Intern @ T-Mobile",
  description: "I'm joining T-Mobile as an ML Engineer in Summer 2026.",
  openGraph: {
    title: "I'm joining T-Mobile",
    description: "As an ML Engineer · Summer 2026",
    url: "https://tmobile.sahassharma.com",
    siteName: "tmobile.sahassharma.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "I'm joining T-Mobile",
    description: "As an ML Engineer · Summer 2026",
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
