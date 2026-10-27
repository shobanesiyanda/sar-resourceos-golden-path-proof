import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealScope | Investigate Deal Credibility, Viability & Opportunities",
  description: "Know what you are dealing with before you commit. Deal integrity, evidence investigation, opportunity intelligence, route economics and a permission-controlled commercial exchange.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
