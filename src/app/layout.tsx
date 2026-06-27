import type { Metadata } from "next";
import { Inter, Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import AppShell from "@/components/layout/AppShell";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "AstroGuru | Your Vedic Companion",
  description: "Vedic astrology insights — Kundli, Rashi, daily horoscopes, and expert consultations.",
  openGraph: {
    title: "AstroGuru | Your Vedic Companion",
    description: "Vedic astrology insights — Kundli, Rashi, daily horoscopes, and expert consultations.",
    type: "website",
    url: "https://astroguru.com",
    siteName: "AstroGuru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${notoDevanagari.variable} font-sans antialiased bg-cream text-ink`}>
        <SessionProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFF8F0",
                color: "#2E1410",
                border: "1px solid #FCE9DA",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
