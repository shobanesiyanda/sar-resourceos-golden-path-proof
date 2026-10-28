import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealScope | Weekly Market Intelligence & Commodity Deal Assessment",
  description: "Bring your commodity contract, stock or supplier offer. Understand market pricing, material requirements, buying limits, logistics, feasibility and evidence risks before you commit.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
