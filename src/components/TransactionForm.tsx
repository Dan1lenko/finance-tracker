"use client";

import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { TransactionType } from "@prisma/client";

/** Генерація UUID без crypto.randomUUID (сумісність з HTTP та старими браузерами) */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Декларативний Компонент Форми
 * 
 * Обробляє введення користувача та відправляє дії (actions) в store.
 */
export default function TransactionForm() {
  const { addTransaction, activeContext, activeFamilyId, currentUser } = useFinanceStore();
  
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    addTransaction({
      id: generateUUID(), // Optimistic ID generation
      amount: parseFloat(amount),
      currency,
      type,
      category,
      description: "",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUser?.id || "guest",
      familyId: activeContext === 'FAMILY' ? activeFamilyId : null
    });

    // Reset form
    setAmount("");
    setCategory("");
  };

  return (
    <div className="glass-card p-6 h-fit">
      <h3 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <PlusCircle className="w-5 h-5" style={{ color: 'var(--accent-violet)' }} />
        Додати транзакцію
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Тип</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={type === "INCOME" 
                ? { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }
              }
            >
              <ArrowUpCircle className="w-4 h-4" />
              Дохід
            </button>
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={type === "EXPENSE" 
                ? { background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }
              }
            >
              <ArrowDownCircle className="w-4 h-4" />
              Витрата
            </button>
          </div>
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
             <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Сума</label>

             {/* Custom amount stepper: [↓]  [input]  [↑] */}
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

               {/* ↓ minus button */}
               <button
                 type="button"
                 tabIndex={-1}
                 onClick={() => setAmount(v => Math.max(0, parseFloat(v || '0') - 1).toFixed(2))}
                 style={{
                   flexShrink: 0,
                   width: 34, height: 42,
                   borderRadius: 10,
                   border: '1px solid rgba(244,63,94,0.35)',
                   background: 'rgba(244,63,94,0.08)',
                   color: '#fb7185',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.18s',
                 }}
                 onMouseEnter={e => {
                   e.currentTarget.style.background = 'rgba(244,63,94,0.22)';
                   e.currentTarget.style.borderColor = 'rgba(244,63,94,0.6)';
                   e.currentTarget.style.transform = 'scale(1.08)';
                 }}
                 onMouseLeave={e => {
                   e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
                   e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)';
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               >
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="5" y1="12" x2="19" y2="12" />
                 </svg>
               </button>

               {/* number input */}
               <input
                 type="number"
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
                 placeholder="0.00"
                 step="0.01"
                 min="0"
                 required
                 className="amount-no-spin"
                 style={{
                   flex: 1,
                   minWidth: 0,
                   background: 'rgba(255,255,255,0.05)',
                   border: '1px solid var(--border-glass)',
                   borderRadius: 10,
                   color: 'var(--text-primary)',
                   textAlign: 'center',
                   fontSize: '1rem',
                   fontWeight: 700,
                   padding: '10px 6px',
                   outline: 'none',
                 } as React.CSSProperties}
                 onFocus={e => {
                   e.currentTarget.style.borderColor = 'var(--accent-violet)';
                   e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
                 }}
                 onBlur={e => {
                   e.currentTarget.style.borderColor = 'var(--border-glass)';
                   e.currentTarget.style.boxShadow = 'none';
                 }}
               />

               {/* ↑ plus button */}
               <button
                 type="button"
                 tabIndex={-1}
                 onClick={() => setAmount(v => (parseFloat(v || '0') + 1).toFixed(2))}
                 style={{
                   flexShrink: 0,
                   width: 34, height: 42,
                   borderRadius: 10,
                   border: '1px solid rgba(16,185,129,0.35)',
                   background: 'rgba(16,185,129,0.08)',
                   color: '#6ee7b7',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.18s',
                 }}
                 onMouseEnter={e => {
                   e.currentTarget.style.background = 'rgba(16,185,129,0.22)';
                   e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
                   e.currentTarget.style.transform = 'scale(1.08)';
                 }}
                 onMouseLeave={e => {
                   e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                   e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               >
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="12" y1="5" x2="12" y2="19" />
                   <line x1="5" y1="12" x2="19" y2="12" />
                 </svg>
               </button>

             </div>
          </div>

          <div>
             <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Валюта</label>
             <select
               value={currency}
               onChange={(e) => setCurrency(e.target.value)}
               className="glass-input"
               style={{ cursor: 'pointer' }}
             >
               <option value="UAH">₴ UAH</option>
               <option value="USD">$ USD</option>
               <option value="EUR">€ EUR</option>
             </select>
          </div>
        </div>

        {/* Category */}
        <div>
           <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Категорія</label>
           <input
             type="text"
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             placeholder="напр., Їжа, Зарплата"
             className="glass-input"
             required
           />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="gradient-btn w-full py-3 text-sm"
        >
          Додати транзакцію
        </button>
      </form>
    </div>
  );
}
