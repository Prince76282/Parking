import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "DesignGym · LLD Practice",
  description:
    "Practice low-level design problems, submit structured solutions, and receive evidence-based rubric feedback to improve across attempts.",
  keywords: ["LLD", "low-level design", "software design", "OOP practice", "design patterns"]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
