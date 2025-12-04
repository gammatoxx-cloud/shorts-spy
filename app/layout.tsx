import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalHeader from "@/components/ConditionalHeader";

// Configure Sora for headers
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

// Configure Manrope for body text
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shorts Spy - Analyze TikTok Creator Performance",
  description: "Spy on any TikTok creator's short-form content performance with detailed metrics and insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sora.variable} ${manrope.variable} antialiased relative`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative z-10">
            <ConditionalHeader />
            <main className="flex-1 relative z-10">{children}</main>
            <footer className="border-t border-white/10 mt-auto relative z-10">
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-white/60">
                    © 2025 Shorts Spy. All rights reserved.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <a
                      href="/contact"
                      className="text-white/60 hover:text-blue-400 transition-colors"
                    >
                      Contact & Help
                    </a>
                    <a
                      href="/privacy"
                      className="text-white/60 hover:text-blue-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="/terms"
                      className="text-white/60 hover:text-blue-400 transition-colors"
                    >
                      Terms & Conditions
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

