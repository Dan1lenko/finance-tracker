"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getCurrencySymbol } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Clock, ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter } from "lucide-react";

export default function TransactionsClient() {
  const router = useRouter();
  const { transactions, families, activeContext, activeFamilyId, currentUser, removeTransaction } = useFinanceStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="p-8" style={{ color: 'var(--color-muted)' }}>Завантаження...</div>;

  const filtered = transactions
    .filter(t => activeContext === 'PERSONAL' ? t.userId === currentUser?.id : t.familyId === activeFamilyId)
    .filter(t => typeFilter === "ALL" || t.type === typeFilter)
    .filter(t => search === "" || t.category.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-muted)'; }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl flex items-center gap-2" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
              <Clock className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Всі транзакції
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>{filtered.length} записів</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card-income p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--color-income)' }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-income-text)' }}>Доходи</span>
            </div>
            <p className="text-xl" style={{ color: 'var(--color-income-text)', fontWeight: 500 }}>+{totalIncome.toFixed(2)} ₴</p>
          </div>
          <div className="stat-card-expense p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-expense-text)' }}>Витрати</span>
            </div>
            <p className="text-xl" style={{ color: 'var(--color-expense-text)', fontWeight: 500 }}>-{totalExpense.toFixed(2)} ₴</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
            <input type="text" placeholder="Пошук за категорією..." value={search}
              onChange={e => setSearch(e.target.value)} className="glass-input glass-input-icon w-full" />
          </div>
          <div className="flex gap-2">
            {(["ALL", "INCOME", "EXPENSE"] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={
                  f === "ALL" && typeFilter === f
                    ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary-text)', border: '0.5px solid var(--color-primary)' }
                    : f === "INCOME" && typeFilter === f
                    ? { background: 'var(--color-income-bg)', color: 'var(--color-income-text)', border: '0.5px solid var(--color-income)' }
                    : f === "EXPENSE" && typeFilter === f
                    ? { background: 'var(--color-expense-bg)', color: 'var(--color-expense-text)', border: '0.5px solid var(--color-expense)' }
                    : { background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' }
                }>
                {f === "ALL" ? "Всі" : f === "INCOME" ? "Доходи" : "Витрати"}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        <div className="glass-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Filter className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-surface-2)' }} />
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Транзакцій не знайдено</p>
            </div>
          ) : (
            <ul>
              {filtered.map((t, idx) => {
                const transactionFamily = t.familyId ? families.find(f => f.id === t.familyId) : null;
                const symbol = getCurrencySymbol(t.currency);
                const activeFamilyObj = activeContext === 'FAMILY' ? families.find(f => f.id === activeFamilyId) : null;
                const member = activeFamilyObj ? (activeFamilyObj.members ?? []).find(m => m.id === t.userId) : null;
                const memberInitial = member ? (member.name?.[0] || member.email[0]).toUpperCase() : null;
                const memberName = member ? (member.name || member.email) : null;
                const isMe = member?.id === currentUser?.id;

                return (
                  <li key={t.id} className="flex items-center justify-between px-5 py-4 transition-colors group"
                    style={{ borderBottom: idx < filtered.length - 1 ? '0.5px solid var(--color-surface-2)' : 'none' }}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: t.type === 'INCOME' ? 'var(--color-income-bg)' : 'var(--color-expense-bg)' }}>
                        {t.type === 'INCOME'
                          ? <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--color-income)' }} />
                          : <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />}
                      </div>
                      {memberInitial && (
                        <div title={memberName ?? ''} className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: isMe ? 'var(--color-income-bg)' : 'var(--color-surface-2)', color: isMe ? 'var(--color-income-text)' : '#5a4a3a' }}>
                          {memberInitial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{t.category}</p>
                          {transactionFamily && activeContext === 'PERSONAL' && <span className="badge badge-violet">{transactionFamily.name}</span>}
                        </div>
                        {memberName && (
                          <p className="text-xs mt-0.5 font-medium" style={{ color: isMe ? 'var(--color-primary)' : 'var(--color-income-text)' }}>
                            {isMe ? 'Ви' : memberName}
                          </p>
                        )}
                        {t.description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{t.description}</p>}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {new Date(t.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="font-bold text-base" style={{ color: t.type === 'INCOME' ? 'var(--color-income-text)' : 'var(--color-expense-text)' }}>
                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)} {symbol}
                      </span>
                      <button onClick={() => {
                        toast.warning('Видалити цю транзакцію?', {
                          action: { label: 'Видалити', onClick: () => removeTransaction(t.id) },
                          cancel: { label: 'Скасувати', onClick: () => {} },
                          duration: 5000,
                        });
                      }} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: 'var(--color-expense)', background: 'var(--color-expense-bg)' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#efbfb0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-expense-bg)'} title="Видалити">
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
