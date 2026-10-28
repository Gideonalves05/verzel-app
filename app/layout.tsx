import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verzel Leilões — Casa de leilões online",
  description:
    "Vitrine pública de lotes, sala do lote ao vivo e auditoria pública da casa de leilões Verzel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
            Verzel · Casa de leilões · teste Elite Dev
          </footer>
        </Providers>
      </body>
    </html>
  );
}
