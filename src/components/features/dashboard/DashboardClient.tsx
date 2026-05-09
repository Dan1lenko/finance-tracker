"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getCurrencySymbol } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Clock, PieChart, ChevronRight, Plus, Check, X } from "lucide-react";
import MemberSearchModalClient from "@/components/features/family/MemberSearchModalClient";
import { toast } from "sonner";

export default function DashboardClient() {
  const router = useRouter();
  const { balances, expensesByCategory, transactions, activeContext, families, activeFamilyId, currentUser, renameFamily, removeMemberFromFamily, deleteFamily } = useFinanceStore();

  const currentFamily = families.find(f => f.id === activeFamilyId);
  const filteredTransactions = transactions.filter(t => activeContext === 'PERSONAL' ? t.userId === currentUser?.id : t.familyId === activeFamilyId);

  const incomeByCurrency = filteredTransactions.filter(t => t.type === "INCOME")
    .reduce((acc, t) => ({ ...acc, [t.currency]: (acc[t.currency] || 0) + t.amount }), {} as Record<string, number>);
  const expenseByCurrency = filteredTransactions.filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => ({ ...acc, [t.currency]: (acc[t.currency] || 0) + t.amount }), {} as Record<string, number>);

  const currencies = Array.from(new Set([...Object.keys(balances), ...Object.keys(incomeByCurrency), ...Object.keys(expenseByCurrency)]));
  if (currencies.length === 0) currencies.push("UAH");

  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [renamingFamilyId, setRenamingFamilyId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="p-6" style={{ color: 'var(--color-muted)' }}>Завантаження...</div>;

  const handleRemoveMember = (memberId: string, memberName: string) => {
    toast.warning(`Видалити "${memberName}" з групи?`, {
      action: { label: 'Видалити', onClick: () => removeMemberFromFamily(currentFamily!.id, memberId) },
      cancel: { label: 'Скасувати', onClick: () => {} },
      duration: 6000,
    });
  };

  const handleDeleteFamily = () => {
    toast.warning('Видалити групу назавжди?', {
      description: 'Цю дію неможливо скасувати.',
      action: { label: 'Видалити', onClick: () => deleteFamily(currentFamily!.id) },
      cancel: { label: 'Скасувати', onClick: () => {} },
      duration: 8000,
    });
  };

  const handleStartRename = () => { setRenameValue(currentFamily?.name ?? ""); setRenamingFamilyId(currentFamily?.id ?? null); };
  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingFamilyId && renameValue.trim() && renameValue !== currentFamily?.name) renameFamily(renamingFamilyId, renameValue.trim());
    setRenamingFamilyId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
            {activeContext === 'PERSONAL' ? 'Мій гаманець' : currentFamily?.name || 'Сімейна група'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {activeContext === 'PERSONAL' ? 'Ваш особистий фінансовий огляд' : `Спільний бюджет для ${currentFamily?.name}`}
          </p>
        </div>
      </div>

      {/* Family Members */}
      {activeContext === 'FAMILY' && currentFamily && (
        <div className="glass-card p-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Учасники групи</h4>
            {currentUser?.id === currentFamily.ownerId && (
              <button onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{ color: 'var(--color-primary-text)', background: 'var(--color-primary-bg)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#bbc8f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}>
                <Plus className="w-3.5 h-3.5" /> Додати учасника
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {currentFamily.members?.map(member => (
              <div key={member.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${member.id === currentUser?.id ? 'badge-violet' : ''}`}
                style={member.id !== currentUser?.id ? { background: 'var(--color-surface)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' } : {}}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: member.id === currentUser?.id ? 'var(--color-primary-bg)' : 'var(--color-surface-2)', color: member.id === currentUser?.id ? 'var(--color-primary-text)' : '#5a4a3a' }}>
                  {member.name?.[0] || member.email[0].toUpperCase()}
                </div>
                {member.name || member.email} {member.id === currentUser?.id && "(Ви)"}
                {member.id === currentFamily.ownerId && <span className="ml-1 badge badge-amber">Admin</span>}
                {currentUser?.id === currentFamily.ownerId && member.id !== currentUser.id && (
                  <button onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                    className="ml-1 transition-colors" style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-expense)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}>×</button>
                )}
              </div>
            ))}
          </div>
          {currentUser?.id === currentFamily.ownerId && (
            <div className="mt-4 pt-3 flex flex-col gap-3" style={{ borderTop: '0.5px solid var(--color-surface-2)' }}>
              {renamingFamilyId === currentFamily.id ? (
                <form onSubmit={handleSubmitRename} className="flex gap-2">
                  <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} className="glass-input text-sm flex-1" placeholder="Нова назва..." />
                  <button type="submit" className="gradient-btn px-3 py-1.5 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Зберегти</button>
                  <button type="button" onClick={() => setRenamingFamilyId(null)} className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
                    style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '0.5px solid var(--color-surface-2)' }}>
                    <X className="w-3 h-3" /> Скасувати
                  </button>
                </form>
              ) : (
                <div className="flex justify-end gap-3">
                  <button onClick={handleStartRename} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--color-income-text)', background: 'var(--color-income-bg)', border: '0.5px solid var(--color-income)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#a8e8e3'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-income-bg)'}>Змінити назву</button>
                  <button onClick={handleDeleteFamily} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--color-expense-text)', background: 'var(--color-expense-bg)', border: '0.5px solid var(--color-expense)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#efbfb0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-expense-bg)'}>Видалити групу</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="space-y-6">
        {currencies.map(currency => (
          <div key={currency} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card-balance">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Баланс {currency}</span>
                </div>
                <h3 className="text-2xl" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                  {(balances[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
                </h3>
                {(balances[currency] || 0) < 0 && <span className="text-[10px] mt-1 inline-block" style={{ color: 'var(--color-expense-text)' }}>Негативний баланс</span>}
              </div>
            </div>
            <div className="stat-card-income">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpCircle className="w-5 h-5" style={{ color: 'var(--color-income)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-income-text)' }}>Дохід</span>
              </div>
              <h3 className="text-2xl" style={{ color: 'var(--color-income-text)', fontWeight: 500 }}>
                +{(incomeByCurrency[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
              </h3>
            </div>
            <div className="stat-card-expense">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownCircle className="w-5 h-5" style={{ color: 'var(--color-expense)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-expense-text)' }}>Витрати</span>
              </div>
              <h3 className="text-2xl" style={{ color: 'var(--color-expense-text)', fontWeight: 500 }}>
                -{(expenseByCurrency[currency] || 0).toFixed(2)} {getCurrencySymbol(currency)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="flex flex-col gap-6">
        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base flex items-center gap-2" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Останні транзакції
            </h4>
            <button onClick={() => router.push('/transactions')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-primary-text)', background: 'var(--color-primary-bg)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#bbc8f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}>
              Всі транзакції <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul>
            {filteredTransactions.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--color-muted)' }}>Транзакцій ще немає.</p>
            ) : (
              filteredTransactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((t, idx, arr) => {
                const transactionFamily = t.familyId ? families.find(f => f.id === t.familyId) : null;
                const symbol = getCurrencySymbol(t.currency);
                const member = activeContext === 'FAMILY' && currentFamily ? (currentFamily.members ?? []).find(m => m.id === t.userId) : null;
                const memberInitial = member ? (member.name?.[0] || member.email[0]).toUpperCase() : null;
                const memberName = member ? (member.name || member.email) : null;
                const isMe = member?.id === currentUser?.id;
                return (
                  <li key={t.id} className="flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors"
                    style={{ borderBottom: idx < arr.length - 1 ? '0.5px solid var(--color-surface-2)' : 'none' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: t.type === 'INCOME' ? 'var(--color-income-bg)' : 'var(--color-expense-bg)' }}>
                        {t.type === 'INCOME'
                          ? <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--color-income)' }} />
                          : <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--color-expense)' }} />}
                      </div>
                      {memberInitial && (
                        <div title={memberName ?? ''} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ background: isMe ? 'var(--color-income-bg)' : 'var(--color-surface-2)', color: isMe ? 'var(--color-income-text)' : '#5a4a3a' }}>
                          {memberInitial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{t.category}</p>
                          {transactionFamily && activeContext === 'PERSONAL' && <span className="badge badge-violet">{transactionFamily.name}</span>}
                        </div>
                        {memberName && <p className="text-xs mt-0.5" style={{ color: isMe ? 'var(--color-primary)' : 'var(--color-income-text)' }}>{isMe ? 'Ви' : memberName}</p>}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm flex-shrink-0 ml-3"
                      style={{ color: t.type === 'INCOME' ? 'var(--color-income-text)' : 'var(--color-expense-text)' }}>
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
            <h4 className="text-base flex items-center gap-2" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
              <PieChart className="w-4 h-4" style={{ color: 'var(--color-income)' }} /> Витрати за категоріями
            </h4>
            <button onClick={() => router.push('/categories')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-income-text)', background: 'var(--color-income-bg)', border: '0.5px solid var(--color-income)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#a8e8e3'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-income-bg)'}>
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
                <div key={currency} className="pb-3" style={{ borderBottom: '0.5px solid var(--color-surface-2)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>{currency}</p>
                  {Object.entries(cats).map(([category, amount]) => {
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={category} className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>{category}</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--color-expense-text)' }}>{amount.toFixed(2)} {symbol}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: 'var(--color-expense)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {Object.keys(expensesByCategory).length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--color-muted)' }}>Даних про витрати немає.</p>
            )}
          </div>
        </div>
      </div>

      {activeContext === 'FAMILY' && activeFamilyId && (
        <MemberSearchModalClient isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} familyId={activeFamilyId} />
      )}
    </div>
  );
}
