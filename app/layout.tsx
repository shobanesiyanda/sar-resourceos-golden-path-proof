import type { Metadata } from "next";
import "./globals.css";
import AuthQuickAccess from "../components/AuthQuickAccess";

export const metadata: Metadata = {
  title: "SAR ResourceOS",
  description:
    "SAR ResourceOS live chrome parcel control system for opportunity intake, route economics, execution readiness, dispatch, reconciliation, approvals, exceptions, and finance handoff.",
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
