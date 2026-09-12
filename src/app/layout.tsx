import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/components/providers/ui-provider";
import { AppShell } from "@/components/layout/app-shell";
import { FinanceProvider } from "@/lib/finance/finance-provider";
import { CatalogProvider } from "@/lib/catalog/catalog-provider";
import { ContactsProvider } from "@/lib/contacts/contacts-provider";
import { SalesProvider } from "@/lib/sales/sales-provider";
import { TasksProvider } from "@/lib/tasks/tasks-provider";

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
        <FinanceProvider>
          <CatalogProvider>
            <ContactsProvider>
              <SalesProvider>
                <TasksProvider>
                  <UIProvider>
                    <AppShell>{children}</AppShell>
                  </UIProvider>
                </TasksProvider>
              </SalesProvider>
            </ContactsProvider>
          </CatalogProvider>
        </FinanceProvider>
      </body>
    </html>
  );
}
