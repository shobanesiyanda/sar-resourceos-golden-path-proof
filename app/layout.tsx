import type { Metadata } from "next";
import "./globals.css";
import AuthQuickAccess from "../components/AuthQuickAccess";

export const metadata: Metadata = {
  title: "SAR ResourceOS",
  description:
    "SAR ResourceOS live chrome parcel control system for opportunity intake, route pricing, release gating, parcel execution and finance readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthQuickAccess />
        {children}
      </body>
    </html>
  );
}
