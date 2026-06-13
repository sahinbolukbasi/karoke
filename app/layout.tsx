import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import "./globals.css";
import { ProviderWrapper } from "@/components/ProviderWrapper";

const displayFont = Prata({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monochrome Stage Karaoke",
  description: "Sade siyah-beyaz karaoke platformu. Spotify, Bluetooth, mikrofon ve tam ekran deneyimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
