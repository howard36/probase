import { Metadata } from "next";
import Providers from "./providers";
import { Inter } from "next/font/google";

import "../styles/globals.css";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/utils/utils";
config.autoAddCss = false;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Probase",
  description: "A math contest problem database",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
      <link rel="icon" href="/favicon.ico" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
      */}
      <body className={cn("bg-slate-50", inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
