import type { Metadata, Viewport } from "next";
import "@fontsource/michroma/latin-400.css";
import "@fontsource/m-plus-rounded-1c/latin-400.css";
import "@fontsource/m-plus-rounded-1c/latin-500.css";
import "@fontsource/m-plus-rounded-1c/latin-700.css";
import "@fontsource/share-tech-mono/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "RISKI.EXE | Memory Card Portfolio",
  description:
    "The developer portfolio of Riski Wahyu Saputra, told through six save files on a retro console memory card.",
  authors: [{ name: "Riski Wahyu Saputra" }],
  openGraph: {
    title: "RISKI.EXE | Memory Card Portfolio",
    description: "Boot the system, browse the memory card, load a save file.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
