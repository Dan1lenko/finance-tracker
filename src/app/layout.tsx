import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreInitializer from "@/components/StoreInitializer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Сімейний Фінансовий Трекер",
  description: "Курсовий проєкт з використанням Next.js, TypeScript та Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              background: "#1e2030",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f0f0f5",
            },
          }}
        />
        <StoreInitializer />
      </body>
    </html>
  );
}
