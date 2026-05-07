import type { Metadata } from "next";
import HomeClient from "@/components/features/dashboard/HomeClient";

export const metadata: Metadata = {
  title: "Сімейний Фінансовий Трекер",
  description: "Головна сторінка — огляд фінансів та форма додавання транзакцій",
};

/**
 * Головна сторінка (Server Component)
 * 
 * Декларативна парадигма: page.tsx — чистий Server Component без будь-якої клієнтської логіки.
 * Вся інтерактивність делегована до HomeClient.
 */
export default function HomePage() {
  return <HomeClient />;
}
