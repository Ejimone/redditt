import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import LeftSidebar from "@/components/layout/LeftSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { SearchProvider } from "@/lib/search-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "Reddit Clone",
    template: "%s | Reddit Clone",
  },
  description:
    "Communities, posts, comments, and votes — a Reddit-style app built with Next.js and Strapi.",
  openGraph: {
    title: "Reddit Clone",
    description:
      "Communities, posts, and discussion powered by Next.js and Strapi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", geistSans.variable, geistMono.variable)}
    >
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        <SearchProvider>
          <Suspense
            fallback={
              <div className="h-14 border-b border-border bg-background/95" />
            }
          >
            <Navbar />
          </Suspense>
          <div
            className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[1600px] justify-center pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:justify-start md:pb-4"
          >
            <LeftSidebar />
            <div className="min-w-0 flex-1 border-border px-2 py-3 sm:px-4 md:border-x md:px-4 md:py-4 lg:px-6">
              {children}
            </div>
          </div>
          <MobileBottomNav />
        </SearchProvider>
      </body>
    </html>
  );
}
