import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DynoPrice Decision Engine",
  description: "Transparent pricing and channel recommendations for perishable inventory"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
