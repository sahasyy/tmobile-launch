import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ML Intern @ T-Mobile",
  description:
    "I'll be an ML intern at T-Mobile this summer. A camera-reactive hard launch.",
  openGraph: {
    title: "ML Intern @ T-Mobile",
    description: "I'll be an ML intern at T-Mobile this summer.",
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
      <body className={`${display.variable} ${mono.variable} grain`}>
        {children}
      </body>
    </html>
  );
}
