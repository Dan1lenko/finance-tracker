"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getCurrencySymbol } from "@/lib/utils";
import { ArrowLeft, PieChart, TrendingDown } from "lucide-react";

const COLORS = [
  '#4361EE', '#2EC4B6', '#E76F51', '#b07d3a',
  '#6a7ef5', '#4dd8cc', '#ef9070', '#c89a5a',
];

export default function CategoriesClient() {
  const router = useRouter();
  const { expensesByCategory } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-8" style={{ color: 'var(--color-muted)' }}>Завантаження...</div>;

  const currencies = Object.keys(expensesByCategory);
  const hasData = currencies.some(c => Object.keys(expensesByCategory[c] || {}).length > 0);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-border)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <PieChart className="w-6 h-6" style={{ color: 'var(--color-income)' }} />
              Витрати за категоріями
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>Детальний аналіз ваших витрат</p>
          </div>
        </div>

        {!hasData ? (
          <div className="glass-card py-20 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
            <p className="text-base font-medium" style={{ color: 'var(--color-muted)' }}>Даних про витрати немає</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>Додайте транзакції типу &quot;Витрата&quot;</p>
          </div>
        ) : (
          currencies.map(currency => {
            const cats = expensesByCategory[currency] || {};
            if (Object.keys(cats).length === 0) return null;
            const symbol = getCurrencySymbol(currency);
            const total = Object.values(cats).reduce((a, b) => a + b, 0);
            const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a);
            return (
              <div key={currency} className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>{currency}</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-expense-text)' }}>-{total.toFixed(2)} {symbol}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {sorted.length} {sorted.length === 1 ? 'категорія' : sorted.length < 5 ? 'категорії' : 'категорій'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {sorted.slice(0, 4).map(([cat, amt], i) => (
                      <div
                        key={cat}
                        className="h-2 rounded-full"
                        style={{ width: `${total > 0 ? (amt / total) * 120 : 0}px`, background: COLORS[i % COLORS.length], minWidth: 4 }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border)' }} />
                <div className="space-y-4">
                  {sorted.map(([category, amount], i) => {
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    const color = COLORS[i % COLORS.length];
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-text)' }}>{category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{percentage.toFixed(1)}%</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--color-expense-text)' }}>{amount.toFixed(2)} {symbol}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
