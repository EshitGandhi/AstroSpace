import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarfieldBackground from "@/components/animations/StarfieldBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AstroSpace | Discover Your Cosmic Path",
  description: "A premium astrology SaaS offering deep insights, horoscopes, and professional consultations.",
  openGraph: {
    title: "AstroSpace | Discover Your Cosmic Path",
    description: "A premium astrology SaaS offering deep insights, horoscopes, and professional consultations.",
    type: "website",
    url: "https://astrospace.com",
    siteName: "AstroSpace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}>
          <StarfieldBackground />
          <Navbar />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#151226',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
