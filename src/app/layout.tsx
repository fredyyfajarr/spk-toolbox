import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPK Toolbox",
  description: "Platform Sistem Penunjang Keputusan All-in-One Multi Metode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
          <TooltipProvider>
            <Navbar />
            <div className="flex flex-col min-h-[calc(100vh-4rem)]">
              {children}
              <footer className="py-6 mt-auto border-t border-border/40 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SPK Toolbox. All rights reserved.
              </footer>
            </div>
            <Toaster richColors theme="light" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
