import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/components/providers/ui-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP da Marca",
  description: "Sistema operacional interno da marca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UIProvider>
          <AppShell>{children}</AppShell>
        </UIProvider>
      </body>
    </html>
  );
}
