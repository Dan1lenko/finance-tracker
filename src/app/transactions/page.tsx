"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { ArrowLeft, Clock, ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter } from "lucide-react";

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, families, activeContext, activeFamilyId, currentUser, removeTransaction } = useFinanceStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>Завантаження...</div>;

  const getCurrencySymbol = (c: string) => c === 'USD' ? '$' : c === 'EUR' ? '€' : '₴';

  const filtered = transactions
    .filter(t => {
      if (activeContext === 'PERSONAL') return t.userId === currentUser?.id;
      return t.familyId === activeFamilyId;
    })
    .filter(t => typeFilter === "ALL" || t.type === typeFilter)
    .filter(t =>
      search === "" ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .slice()
    .reverse();

  const totalIncome = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-6 h-6" style={{ color: 'var(--accent-violet)' }} />
              Всі транзакції
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} записів
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Доходи</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--accent-emerald)' }}>
              +{totalIncome.toFixed(2)} ₴
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--accent-rose)' }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Витрати</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--accent-rose)' }}>
              -{totalExpense.toFixed(2)} ₴
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Пошук за категорією..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input glass-input-icon w-full"
            />
          </div>
          {/* Type filter */}
          <div className="flex gap-2">
            {(["ALL", "INCOME", "EXPENSE"] as const).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={typeFilter === f
                  ? { background: 'rgba(139,92,246,0.2)', color: 'var(--accent-violet)', border: '1px solid rgba(139,92,246,0.4)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }
                }
              >
                {f === "ALL" ? "Всі" : f === "INCOME" ? "Доходи" : "Витрати"}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        <div className="glass-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Filter className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Транзакцій не знайдено</p>
            </div>
          ) : (
            <ul>
              {filtered.map((t, idx) => {
                const transactionFamily = t.familyId ? families.find(f => f.id === t.familyId) : null;
                const currency = (t as any).currency || "UAH";
                const symbol = getCurrencySymbol(currency);

                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors group"
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-glass)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Left: icon + info */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: t.type === 'INCOME' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                        }}
                      >
                        {t.type === 'INCOME'
                          ? <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--accent-emerald)' }} />
                          : <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--accent-rose)' }} />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.category}</p>
                          {transactionFamily && activeContext === 'PERSONAL' && (
                            <span className="badge badge-violet">{transactionFamily.name}</span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(t.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Right: amount + delete */}
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-base"
                        style={{ color: t.type === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}
                      >
                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)} {symbol}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm("Видалити цю транзакцію?")) {
                            removeTransaction(t.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
