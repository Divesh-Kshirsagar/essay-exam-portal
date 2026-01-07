import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ExamProvider } from "@/context/ExamContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Portal | Secure Essay Assessment",
  description: "High-concurrency exam portal with anti-cheat features and draft recovery",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ExamProvider>
          {children}
        </ExamProvider>
      </body>
    </html>
  );
}
