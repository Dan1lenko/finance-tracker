import type { Metadata } from "next";
import CategoriesClient from "@/components/features/categories/CategoriesClient";

export const metadata: Metadata = {
  title: "Категорії — Сімейний Фінансовий Трекер",
  description: "Аналіз витрат за категоріями",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
