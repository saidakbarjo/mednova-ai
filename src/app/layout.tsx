import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MEDNOVA AI — Intelligent Healthcare Platform", template: "%s · MEDNOVA AI" },
  description: "Discover verified doctors, book appointments, manage your health records and learn with an educational AI assistant. A university project by Saidakbar & Zukhra.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0A1633" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
