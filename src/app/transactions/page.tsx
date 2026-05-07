import type { Metadata } from "next";
import TransactionsClient from "@/components/features/transactions/TransactionsClient";

export const metadata: Metadata = {
  title: "Транзакції — Сімейний Фінансовий Трекер",
  description: "Перегляд та фільтрація всіх фінансових транзакцій",
};

export default function TransactionsPage() {
  return <TransactionsClient />;
}
