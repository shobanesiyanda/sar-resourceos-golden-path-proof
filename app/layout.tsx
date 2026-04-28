import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAR ResourceOS",
  description:
    "SAR ResourceOS internal resource transaction control system for opportunity intake, route economics, release gating, execution readiness and finance control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
