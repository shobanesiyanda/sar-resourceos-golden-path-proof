import "./globals.css";

export const metadata = {
  title: "SAR ResourceOS Golden Path Proof",
  description: "One full parcel proof from document to finance handoff."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
