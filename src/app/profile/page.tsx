import type { Metadata } from "next";
import ProfileClient from "@/components/features/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Профіль — Сімейний Фінансовий Трекер",
  description: "Управління обліковим записом та сімейними групами",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
