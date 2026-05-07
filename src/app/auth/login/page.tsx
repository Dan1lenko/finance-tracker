import type { Metadata } from "next";
import LoginFormClient from "@/components/features/auth/LoginFormClient";

export const metadata: Metadata = {
  title: "Вхід — Сімейний Фінансовий Трекер",
  description: "Увійдіть до свого облікового запису",
};

export default function LoginPage() {
  return <LoginFormClient />;
}
