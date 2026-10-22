import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealScope | Commodity Intelligence & Deal Runs",
  description: "DealScope commodity discovery, structured deal economics and governed commercial exchange.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
