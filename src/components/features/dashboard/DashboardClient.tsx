"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getCurrencySymbol } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Clock, PieChart, ChevronRight, Plus, Check, X } from "lucide-react";
import MemberSearchModalClient from "@/components/features/family/MemberSearchModalClient";
import { toast } from "sonner";

/**
 * Демонстрація Декларативної Парадигми
 * 
 * 1. UI = f(State): Інтерфейс автоматично відображає поточний стан зі сховища.
 * 2. Жодних маніпуляцій з DOM: Ми не кажемо "онови текст балансу", ми просто рендеримо `balance`.
 */
export default function DashboardClient() {
  const router = useRouter();
  const {
    balances,
    expensesByCategory,
    transactions,
    activeContext,
    families,
    activeFamilyId,
    currentUser,
    renameFamily,
    removeMemberFromFamily,
    deleteFamily,
  } = useFinanceStore();

  const currentFamily = families.find(f => f.id === activeFamilyId);

  const filteredTransactions = transactions.filter(t => {
    if (activeContext === 'PERSONAL') return t.userId === currentUser?.id;
    return t.familyId === activeFamilyId;
  });

  const incomeByCurrency = filteredTransactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => ({ ...acc, [t.currency]: (acc[t.currency] || 0) + t.amount }), {} as Record<string, number>);

  const expenseByCurrency = filteredTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => ({ ...acc, [t.currency]: (acc[t.currency] || 0) + t.amount }), {} as Record<string, number>);

  const currencies = Array.from(new Set([
    ...Object.keys(balances),
    ...Object.keys(incomeByCurrency),
    ...Object.keys(expenseByCurrency),
  ]));
  if (currencies.length === 0) currencies.push("UAH");

  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Inline rename state — замість prompt()
  const [renamingFamilyId, setRenamingFamilyId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="p-6" style={{ color: 'var(--text-muted)' }}>Завантаження...</div>;

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleRemoveMember = (memberId: string, memberName: string) => {
    toast.warning(`Видалити "${memberName}" з групи?`, {
      action: {
        label: 'Видалити',
        onClick: () => removeMemberFromFamily(currentFamily!.id, memberId),
      },
      cancel: { label: 'Скасувати', onClick: () => {} },
      duration: 6000,
    });
  };

  const handleDeleteFamily = () => {
    toast.warning('Видалити групу назавжди?', {
      description: 'Цю дію неможливо скасувати.',
      action: {
        label: 'Видалити',
        onClick: () => deleteFamily(currentFamily!.id),
      },
      cancel: { label: 'Скасувати', onClick: () => {} },
      duration: 8000,
    });
  };

  const handleStartRename = () => {
    setRenameValue(currentFamily?.name ?? "");
    setRenamingFamilyId(currentFamily?.id ?? null);
  };

  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingFamilyId && renameValue.trim() && renameValue !== currentFamily?.name) {
      renameFamily(renamingFamilyId, renameValue.trim());
    }
    setRenamingFamilyId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {activeContext === 'PERSONAL' ? 'Мій гаманець' : currentFamily?.name || 'Сімейна група'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {activeContext === 'PERSONAL'
              ? 'Ваш особистий фінансовий огляд'
              : `Спільний бюджет для ${currentFamily?.name}`}
          </p>
        </div>
      </div>

      {/* Family Members Section */}
      {activeContext === 'FAMILY' && currentFamily && (
        <div className="glass-card p-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Учасники групи</h4>
            {currentUser?.id === currentFamily.ownerId && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--accent-violet)', background: 'rgba(139,92,246,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
              >
                <Plus className="w-3.5 h-3.5" />
                Додати учасника
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {currentFamily.members?.map(member => (
              <div
                key={member.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${member.id === currentUser?.id ? 'badge-violet' : ''}`}
                style={member.id !== currentUser?.id ? { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' } : {}}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: member.id === currentUser?.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                >
                  {member.name?.[0] || member.email[0].toUpperCase()}
                </div>
                {member.name || member.email} {member.id === currentUser?.id && "(Ви)"}
                {member.id === currentFamily.ownerId && <span className="ml-1 badge badge-amber">Admin</span>}
                {currentUser?.id === currentFamily.ownerId && member.id !== currentUser.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                    className="ml-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-rose)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentUser?.id === currentFamily.ownerId && (
            <div className="mt-4 pt-3 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
              {/* Inline rename form */}
              {renamingFamilyId === currentFamily.id ? (
                <form onSubmit={handleSubmitRename} className="flex gap-2">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="glass-input text-sm flex-1"
                    placeholder="Нова назва..."
                  />
                  <button type="submit" className="gradient-btn px-3 py-1.5 text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Зберегти
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingFamilyId(null)}
                    className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                  >
                    <X className="w-3 h-3" /> Скасувати
                  </button>
                </form>
              ) : (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleStartRename}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                  >
                    Змінити назву
                  </button>
                  <button
                    onClick={handleDeleteFamily}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                  >
                    Видалити групу
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stat Cards - Per Currency */}
      <div className="space-y-6">
        {currencies.map(currency => (
          <div key={currency} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card-balance">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-5 h-5 text-white/80" />
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Баланс {currency}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {(balances[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
                  </h3>
                  {(balances[currency] || 0) < 0 && (
                    <span className="text-[10px] text-white/60 mt-1 inline-block">Негативний баланс</span>
                  )}
                </div>
              </div>
              <div className="stat-card-income">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpCircle className="w-5 h-5 text-white/80" />
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Дохід</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  +{(incomeByCurrency[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
                </h3>
              </div>
              <div className="stat-card-expense">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownCircle className="w-5 h-5 text-white/80" />
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Витрати</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  -{(expenseByCurrency[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="flex flex-col gap-6">
        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
              Останні транзакції
            </h4>
            <button
              onClick={() => router.push('/transactions')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--accent-violet)', background: 'rgba(139,92,246,0.1)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
            >
              Всі транзакції <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Транзакцій ще немає.</p>
            ) : (
              filteredTransactions
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(t => {
                  const transactionFamily = t.familyId ? families.find(f => f.id === t.familyId) : null;
                  const symbol = getCurrencySymbol(t.currency);
                  const member = activeContext === 'FAMILY' && currentFamily
                    ? (currentFamily.members ?? []).find(m => m.id === t.userId)
                    : null;
                  const memberInitial = member ? (member.name?.[0] || member.email[0]).toUpperCase() : null;
                  const memberName = member ? (member.name || member.email) : null;
                  const isMe = member?.id === currentUser?.id;

                  return (
                    <li
                      key={t.id}
                      className="flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors"
                      style={{ borderBottom: '1px solid var(--border-glass)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {memberInitial && (
                          <div
                            title={memberName ?? ''}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                            style={{ background: isMe ? 'var(--gradient-brand)' : 'rgba(6,182,212,0.3)' }}
                          >
                            {memberInitial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.category}</p>
                            {transactionFamily && activeContext === 'PERSONAL' && (
                              <span className="badge badge-violet">{transactionFamily.name}</span>
                            )}
                          </div>
                          {memberName && (
                            <p className="text-xs mt-0.5" style={{ color: isMe ? 'var(--accent-violet)' : 'var(--accent-cyan)', opacity: 0.85 }}>
                              {isMe ? 'Ви' : memberName}
                            </p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {new Date(t.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className="font-semibold text-sm flex-shrink-0 ml-3"
                        style={{ color: t.type === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}
                      >
                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)} {symbol}
                      </span>
                    </li>
                  );
                })
            )}
          </ul>
        </div>

        {/* Expenses by Category */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <PieChart className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
              Витрати за категоріями
            </h4>
            <button
              onClick={() => router.push('/categories')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(6,182,212,0.1)')}
            >
              Детальніше <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {currencies.map(currency => {
              const cats = expensesByCategory[currency] || {};
              if (Object.keys(cats).length === 0) return null;
              const symbol = getCurrencySymbol(currency);
              const total = Object.values(cats).reduce((a, b) => a + b, 0);
              return (
                <div key={currency} className="pb-3" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{currency}</p>
                  {Object.entries(cats).map(([category, amount]) => {
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={category} className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{category}</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{amount.toFixed(2)} {symbol}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: 'var(--gradient-expense)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {Object.keys(expensesByCategory).length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Даних про витрати немає.</p>
            )}
          </div>
        </div>
      </div>

      {activeContext === 'FAMILY' && activeFamilyId && (
        <MemberSearchModalClient
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          familyId={activeFamilyId}
        />
      )}
    </div>
  );
}
