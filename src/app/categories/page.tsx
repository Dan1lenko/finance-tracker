"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { ArrowLeft, PieChart, TrendingDown } from "lucide-react";

// A set of distinct colors for category bars
const COLORS = [
  'var(--accent-violet)',
  'var(--accent-cyan)',
  'var(--accent-emerald)',
  'var(--accent-rose)',
  '#f59e0b',
  '#3b82f6',
  '#a855f7',
  '#14b8a6',
];

export default function CategoriesPage() {
  const router = useRouter();
  const { transactions, activeContext, activeFamilyId, currentUser, expensesByCategory } = useFinanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>Завантаження...</div>;

  const getCurrencySymbol = (c: string) => c === 'USD' ? '$' : c === 'EUR' ? '€' : '₴';

  // Per-currency categories
  const currencies = Object.keys(expensesByCategory);
  const hasData = currencies.some(c => Object.keys(expensesByCategory[c] || {}).length > 0);

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
              <PieChart className="w-6 h-6" style={{ color: 'var(--accent-cyan)' }} />
              Витрати за категоріями
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Детальний аналіз ваших витрат
            </p>
          </div>
        </div>

        {!hasData ? (
          <div className="glass-card py-20 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>Даних про витрати немає</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Додайте транзакції типу "Витрата"</p>
          </div>
        ) : (
          currencies.map(currency => {
            const cats = expensesByCategory[currency] || {};
            if (Object.keys(cats).length === 0) return null;

            const symbol = getCurrencySymbol(currency);
            const total = Object.values(cats).reduce((a, b) => a + b, 0);

            // Sort by amount descending
            const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a);

            return (
              <div key={currency} className="glass-card p-6 space-y-6">
                {/* Currency header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{currency}</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent-rose)' }}>
                      -{total.toFixed(2)} {symbol}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {sorted.length} {sorted.length === 1 ? 'категорія' : sorted.length < 5 ? 'категорії' : 'категорій'}
                    </p>
                  </div>

                  {/* Mini donut visual — stacked bar */}
                  <div className="flex flex-col gap-1 items-end">
                    {sorted.slice(0, 4).map(([cat, amt], i) => {
                      const w = total > 0 ? (amt / total) * 120 : 0;
                      return (
                        <div key={cat} className="h-2 rounded-full" style={{ width: `${w}px`, background: COLORS[i % COLORS.length], minWidth: 4 }} />
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border-glass)' }} />

                {/* Category rows */}
                <div className="space-y-4">
                  {sorted.map(([category, amount], i) => {
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    const color = COLORS[i % COLORS.length];

                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>{category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{percentage.toFixed(1)}%</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {amount.toFixed(2)} {symbol}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
