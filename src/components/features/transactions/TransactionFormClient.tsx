"use client";

import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { TransactionType } from "@prisma/client";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function TransactionFormClient() {
  const { addTransaction, activeContext, activeFamilyId, currentUser } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    addTransaction({
      id: generateUUID(), amount: parseFloat(amount), currency, type, category,
      description: "", date: new Date(), createdAt: new Date(), updatedAt: new Date(),
      userId: currentUser?.id || "guest",
      familyId: activeContext === 'FAMILY' ? activeFamilyId : null
    });
    setAmount(""); setCategory("");
  };

  return (
    <div className="glass-card p-6 h-fit">
      <h3 className="text-base mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
        <PlusCircle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Додати транзакцію
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Тип</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setType("INCOME")}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={type === "INCOME"
                ? { background: 'var(--color-income-bg)', color: 'var(--color-income-text)', border: '0.5px solid var(--color-income)' }
                : { background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' }}>
              <ArrowUpCircle className="w-4 h-4" /> Дохід
            </button>
            <button type="button" onClick={() => setType("EXPENSE")}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={type === "EXPENSE"
                ? { background: 'var(--color-expense-bg)', color: 'var(--color-expense-text)', border: '0.5px solid var(--color-expense)' }
                : { background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' }}>
              <ArrowDownCircle className="w-4 h-4" /> Витрата
            </button>
          </div>
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Сума</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* minus */}
              <button type="button" tabIndex={-1} onClick={() => setAmount(v => Math.max(0, parseFloat(v || '0') - 1).toFixed(2))}
                style={{ flexShrink: 0, width: 34, height: 42, borderRadius: 8, border: '0.5px solid var(--color-expense)', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#efbfb0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-expense-bg)'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              {/* input */}
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" required
                className="amount-no-spin"
                style={{ flex: 1, minWidth: 0, background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', textAlign: 'center', fontSize: '1rem', fontWeight: 700, padding: '10px 6px', outline: 'none' } as React.CSSProperties}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.13)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }} />
              {/* plus */}
              <button type="button" tabIndex={-1} onClick={() => setAmount(v => (parseFloat(v || '0') + 1).toFixed(2))}
                style={{ flexShrink: 0, width: 34, height: 42, borderRadius: 8, border: '0.5px solid var(--color-income)', background: 'var(--color-income-bg)', color: 'var(--color-income)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#a8e8e3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-income-bg)'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Валюта</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="glass-input" style={{ cursor: 'pointer' }}>
              <option value="UAH">₴ UAH</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Категорія</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="напр., Їжа, Зарплата" className="glass-input" required />
        </div>

        <button type="submit" className="gradient-btn w-full py-3 text-sm">Додати транзакцію</button>
      </form>
    </div>
  );
}
