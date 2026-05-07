import type { Metadata } from "next";
import RegisterFormClient from "@/components/features/auth/RegisterFormClient";

export const metadata: Metadata = {
  title: "Реєстрація — Сімейний Фінансовий Трекер",
  description: "Створіть новий обліковий запис",
};

export default function RegisterPage() {
  return <RegisterFormClient />;
}
