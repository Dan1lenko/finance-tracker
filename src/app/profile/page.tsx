"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  ArrowLeft, User, Mail, Calendar, LogOut,
  TrendingUp, TrendingDown, Wallet, Users,
  ShieldCheck, Crown,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, transactions, families, balances, logout } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (!currentUser) {
    router.replace("/auth/login");
    return null;
  }

  const getCurrencySymbol = (c: string) => c === "USD" ? "$" : c === "EUR" ? "€" : "₴";

  // Personal transactions only
  const personal = transactions.filter(t => t.userId === currentUser.id && !t.familyId);
  const totalIncome  = personal.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = personal.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const totalTx      = personal.length;

  // All family transactions where user is involved
  const familyTxCount = transactions.filter(t => t.familyId && families.some(f => f.id === t.familyId)).length;

  // Owned vs member families
  const ownedFamilies  = families.filter(f => f.ownerId === currentUser.id);
  const memberFamilies = families.filter(f => f.ownerId !== currentUser.id);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Avatar initials
  const initials = currentUser.name
    ? currentUser.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : currentUser.email[0].toUpperCase();

  // Member since
  const joinedDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        {/* Hero card */}
        <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Background glow */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 260, height: 260,
            background: "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Avatar */}
          <div
            className="relative z-10 flex items-center justify-center text-3xl font-extrabold text-white mb-4 select-none"
            style={{
              width: 88, height: 88, borderRadius: 24,
              background: "var(--gradient-brand)",
              boxShadow: "0 0 32px rgba(139,92,246,0.45)",
            }}
          >
            {initials}
          </div>

          {/* Name + email */}
          <h1 className="text-2xl font-bold mb-1 relative z-10" style={{ color: "var(--text-primary)" }}>
            {currentUser.name || "Без імені"}
          </h1>
          <p className="text-sm mb-4 relative z-10 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Mail className="w-3.5 h-3.5" /> {currentUser.email}
          </p>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap justify-center relative z-10">
            {ownedFamilies.length > 0 && (
              <span className="badge badge-amber flex items-center gap-1">
                <Crown className="w-3 h-3" /> Адміністратор групи
              </span>
            )}
            <span className="badge badge-violet flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Підтверджений користувач
            </span>
            {joinedDate && (
              <span className="badge flex items-center gap-1" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                <Calendar className="w-3 h-3" /> {joinedDate}
              </span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp,   label: "Доходи",      value: `+${totalIncome.toFixed(0)} ₴`,  color: "var(--accent-emerald)" },
            { icon: TrendingDown, label: "Витрати",     value: `-${totalExpense.toFixed(0)} ₴`, color: "var(--accent-rose)" },
            { icon: Wallet,       label: "Транзакцій",  value: totalTx,                          color: "var(--accent-violet)" },
            { icon: Users,        label: "Груп",        value: families.length,                  color: "var(--accent-cyan)" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-4 flex flex-col items-center text-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1a` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Balances */}
        {Object.keys(balances).length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <Wallet className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
              Поточний баланс
            </h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(balances).map(([currency, amount]) => (
                <div key={currency} className="flex flex-col">
                  <span className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{currency}</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: amount >= 0 ? "var(--accent-emerald)" : "var(--accent-rose)" }}
                  >
                    {amount >= 0 ? "+" : ""}{amount.toFixed(2)} {getCurrencySymbol(currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Families */}
        {families.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <Users className="w-4 h-4" style={{ color: "var(--accent-cyan)" }} />
              Сімейні групи ({families.length})
            </h3>
            <div className="space-y-3">
              {families.map(family => {
                const isOwner = family.ownerId === currentUser.id;
                const memberCount = family.members?.length ?? 0;
                return (
                  <div
                    key={family.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                        style={{ background: isOwner ? "var(--gradient-brand)" : "rgba(6,182,212,0.2)" }}
                      >
                        {family.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{family.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
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

        {/* User info card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <User className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
            Дані облікового запису
          </h3>
          <div className="space-y-3">
            {[
              { label: "Ім'я", value: currentUser.name || "—" },
              { label: "Email", value: currentUser.email },
              { label: "ID", value: currentUser.id.slice(0, 8) + "…" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={{ background: "rgba(244,63,94,0.1)", color: "var(--accent-rose)", border: "1px solid rgba(244,63,94,0.25)" }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(244,63,94,0.2)";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(244,63,94,0.1)";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.25)";
          }}
        >
          <LogOut className="w-4 h-4" />
          Вийти з облікового запису
        </button>

      </div>
    </div>
  );
}
