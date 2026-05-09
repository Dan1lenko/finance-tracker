"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { ArrowLeft, User, Mail, Calendar, LogOut, Users, ShieldCheck, Crown } from "lucide-react";

export default function ProfileClient() {
  const router = useRouter();
  const { currentUser, transactions, families, logout } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!currentUser) { router.replace("/auth/login"); return null; }

  const ownedFamilies = families.filter(f => f.ownerId === currentUser.id);
  const joinedDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }) : null;
  const initials = currentUser.name
    ? currentUser.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : currentUser.email[0].toUpperCase();

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto space-y-6">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm transition-all" style={{ color: "var(--color-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-muted)"}>
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        {/* Hero card */}
        <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 260, height: 260, background: "radial-gradient(circle, rgba(52,81,209,0.08), transparent 70%)", pointerEvents: "none" }} />
          <div className="relative z-10 flex items-center justify-center text-3xl font-extrabold mb-4 select-none"
            style={{ width: 88, height: 88, borderRadius: 24, background: "var(--color-primary)", color: "#ffffff", boxShadow: "0 4px 20px rgba(52,81,209,0.25)" }}>
            {initials}
          </div>
          <h1 className="text-2xl mb-1 relative z-10" style={{ color: "var(--color-text)", fontWeight: 500 }}>
            {currentUser.name || "Без імені"}
          </h1>
          <p className="text-sm mb-4 relative z-10 flex items-center gap-1.5" style={{ color: "var(--color-muted)" }}>
            <Mail className="w-3.5 h-3.5" /> {currentUser.email}
          </p>
          <div className="flex gap-2 flex-wrap justify-center relative z-10">
            {ownedFamilies.length > 0 && (
              <span className="badge badge-amber flex items-center gap-1"><Crown className="w-3 h-3" /> Адміністратор групи</span>
            )}
            <span className="badge badge-violet flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Підтверджений користувач</span>
            {joinedDate && (
              <span className="badge flex items-center gap-1" style={{ background: "var(--color-surface)", color: "var(--color-muted)", border: "0.5px solid var(--color-surface-2)" }}>
                <Calendar className="w-3 h-3" /> {joinedDate}
              </span>
            )}
          </div>
        </div>

        {/* Families */}
        {families.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm mb-4 flex items-center gap-2" style={{ color: "var(--color-text)", fontWeight: 500 }}>
              <Users className="w-4 h-4" style={{ color: "var(--color-income)" }} /> Сімейні групи ({families.length})
            </h3>
            <div className="space-y-3">
              {families.map(family => {
                const isOwner = family.ownerId === currentUser.id;
                const memberCount = family.members?.length ?? 0;
                return (
                  <div key={family.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-surface-2)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ background: isOwner ? "var(--color-primary)" : "var(--color-income-bg)", color: isOwner ? "#ffffff" : "var(--color-income-text)" }}>
                        {family.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{family.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                          {memberCount} {memberCount === 1 ? "учасник" : memberCount < 5 ? "учасники" : "учасників"}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${isOwner ? "badge-amber" : "badge-violet"} flex items-center gap-1`}>
                      {isOwner ? <><Crown className="w-3 h-3" /> Адмін</> : <><User className="w-3 h-3" /> Учасник</>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm flex items-center gap-2" style={{ color: "var(--color-text)", fontWeight: 500 }}>
            <User className="w-4 h-4" style={{ color: "var(--color-primary)" }} /> Дані облікового запису
          </h3>
          <div className="space-y-3">
            {[{ label: "Ім'я", value: currentUser.name || "—" }, { label: "Email", value: currentUser.email }, { label: "ID", value: currentUser.id.slice(0, 8) + "…" }]
              .map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: "0.5px solid var(--color-surface-2)" }}>
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{value}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={{ background: "var(--color-expense-bg)", color: "var(--color-expense-text)", border: "0.5px solid var(--color-expense)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#efbfb0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-expense-bg)"; }}>
          <LogOut className="w-4 h-4" /> Вийти з облікового запису
        </button>
      </div>
    </div>
  );
}
