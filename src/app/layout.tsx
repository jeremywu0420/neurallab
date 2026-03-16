import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ParticleBackground } from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "NeuralLab - 互動式神經網路學習平台",
  description: "從零開始學習神經網路，透過互動式視覺化與實作編程，深入理解深度學習的核心概念",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased grid-bg">
        <ParticleBackground />
        <Navbar />
        <main className="pt-16 relative" style={{ zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
