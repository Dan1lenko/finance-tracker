import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '@prisma/client';
import { calculateBalance, getExpensesByCategory } from '@/lib/logic/finance';
import { toast } from 'sonner';
import type { Family, ContextType, FinanceState } from '@/types';

/**
 * Демонстрація Реактивної Парадигми
 * 
 * 1. Єдине джерело істини (Single Source of Truth): Сховище (store) тримає глобальний стан.
 * 2. Реактивність (Reactivity): Компоненти підписуються на зміни стану і автоматично перемальовуються.
 * 3. Односпрямований потік даних (Unidirectional Data Flow): Actions -> Оновлення стану -> Оновлення UI.
 */

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Чиста функція (Функціональна парадигма) — перераховує баланс та витрати за категоріями.
 * Винесена за межі store, щоб не потрапляти в публічний інтерфейс і не потребувати `as any`.
 */
function recalculate(state: {
  transactions: Transaction[];
  activeContext: ContextType;
  activeFamilyId: string | null;
  currentUser: { id: string } | null;
}): { balances: Record<string, number>; expensesByCategory: Record<string, Record<string, number>> } {
  if (!state.currentUser) return { balances: {}, expensesByCategory: {} };

  const filtered = state.transactions.filter(t => {
    if (state.activeContext === 'PERSONAL') {
      return t.userId === state.currentUser!.id;
    }
    return t.familyId === state.activeFamilyId;
  });

  return {
    balances: calculateBalance(filtered),
    expensesByCategory: getExpensesByCategory(filtered),
  };
}

// ─── Internal store type (extends public FinanceState with fetch helpers) ──

interface StoreState extends FinanceState {
  _fetchTransactions: () => Promise<void>;
  _fetchFamilies: () => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useFinanceStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      families: [],
      currentUser: null,

      activeContext: 'PERSONAL',
      activeFamilyId: null,

      balances: {},
      expensesByCategory: {},

      login: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const user = await res.json();
            set({ currentUser: user, families: user.families || [] });
            get()._fetchTransactions();
            toast.success("Вхід успішний!");
          } else {
            const err = await res.json();
            toast.error(err.error || "Користувача не знайдено");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка входу");
        }
      },

      logout: () => {
        set({
          currentUser: null,
          activeContext: 'PERSONAL',
          activeFamilyId: null,
          transactions: [],
          families: [],
          balances: {},
          expensesByCategory: {},
        });
      },

      register: async (email, name, password) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
          });
          if (res.ok) {
            const user = await res.json();
            set({ currentUser: user });
            get()._fetchTransactions();
            toast.success("Реєстрація успішна!");
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка реєстрації");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка реєстрації");
        }
      },

      addMemberToFamily: async (familyId, email) => {
        try {
          const state = get();
          if (!state.currentUser) return;

          const res = await fetch('/api/families/add-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ familyId, email, requesterId: state.currentUser.id }),
          });

          if (res.ok) {
            const updatedFamily = await res.json();
            toast.success(`Користувача ${email} успішно додано!`);
            set((state) => ({
              families: state.families.map(f =>
                f.id === familyId ? { ...f, members: updatedFamily.members } : f
              ),
            }));
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка додавання");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка з'єднання");
        }
      },

      removeMemberFromFamily: async (familyId, memberId) => {
        try {
          const state = get();
          if (!state.currentUser) return;

          const res = await fetch('/api/families/remove-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ familyId, memberId, requesterId: state.currentUser.id }),
          });

          if (res.ok) {
            const updatedFamily = await res.json();
            toast.success("Користувача видалено");
            set((state) => ({
              families: state.families.map(f =>
                f.id === familyId ? { ...f, members: updatedFamily.members } : f
              ),
            }));
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка видалення");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка з'єднання");
        }
      },

      deleteFamily: async (familyId) => {
        try {
          const state = get();
          if (!state.currentUser) return;

          const res = await fetch(`/api/families/${familyId}?requesterId=${state.currentUser.id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            toast.success("Групу видалено");
            set((state) => ({
              families: state.families.filter(f => f.id !== familyId),
              activeContext: 'PERSONAL',
              activeFamilyId: null,
            }));
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка видалення групи");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка з'єднання");
        }
      },

      renameFamily: async (familyId, name) => {
        try {
          const state = get();
          if (!state.currentUser) return;

          const res = await fetch(`/api/families/${familyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, requesterId: state.currentUser.id }),
          });

          if (res.ok) {
            const updatedFamily = await res.json();
            toast.success("Назву групи оновлено");
            set((state) => ({
              families: state.families.map(f =>
                f.id === familyId ? { ...f, name: updatedFamily.name } : f
              ),
            }));
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка оновлення");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка з'єднання");
        }
      },

      addTransaction: async (transaction) => {
        const tempId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
              const r = (Math.random() * 16) | 0;
              return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            });

        const optimisticTransaction = { ...transaction, id: tempId };

        // Optimistic update
        set((state) => {
          const newTransactions = [...state.transactions, optimisticTransaction];
          return { transactions: newTransactions, ...recalculate({ ...state, transactions: newTransactions }) };
        });

        try {
          const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: transaction.amount,
              currency: transaction.currency,
              type: transaction.type,
              category: transaction.category,
              userId: transaction.userId,
              familyId: transaction.familyId,
            }),
          });

          if (res.ok) {
            const savedTransaction = await res.json();
            // Replace optimistic with real
            set((state) => {
              const newTransactions = state.transactions.map(t => t.id === tempId ? savedTransaction : t);
              return { transactions: newTransactions, ...recalculate({ ...state, transactions: newTransactions }) };
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      removeTransaction: async (id) => {
        // Optimistic remove
        set((state) => {
          const newTransactions = state.transactions.filter(t => t.id !== id);
          return { transactions: newTransactions, ...recalculate({ ...state, transactions: newTransactions }) };
        });

        try {
          const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || "Помилка видалення");
            get()._fetchTransactions();
          } else {
            toast.success("Транзакцію видалено");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка з'єднання");
          get()._fetchTransactions();
        }
      },

      createFamily: async (name) => {
        const state = get();
        if (!state.currentUser) return;

        try {
          const res = await fetch('/api/families', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userId: state.currentUser.id }),
          });

          if (res.ok) {
            const newFamily = await res.json();
            set((state) => ({ families: [...state.families, newFamily] }));
          } else {
            const err = await res.json();
            toast.error(err.error || "Помилка створення групи");
          }
        } catch (e) {
          console.error(e);
          toast.error("Помилка створення групи");
        }
      },

      setActiveContext: (context, familyId) => {
        set((state) => {
          const next = {
            ...state,
            activeContext: context,
            activeFamilyId: familyId ?? null,
          };
          return { ...next, ...recalculate(next) };
        });
      },

      _fetchTransactions: async () => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        try {
          const fetchPromises = [
            fetch(`/api/transactions?userId=${user.id}`).then(r => r.ok ? r.json() : []),
            ...state.families.map(f =>
              fetch(`/api/transactions?familyId=${f.id}`).then(r => r.ok ? r.json() : [])
            ),
          ];

          const results = await Promise.all(fetchPromises);
          const uniqueTransactions: Transaction[] = Array.from(
            new Map((results.flat() as Transaction[]).map(t => [t.id, t])).values()
          );

          set((s) => ({
            transactions: uniqueTransactions,
            ...recalculate({ ...s, transactions: uniqueTransactions }),
          }));
        } catch (e) {
          console.error("Error fetching transactions:", e);
        }
      },

      _fetchFamilies: async () => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        try {
          const res = await fetch(`/api/families?userId=${user.id}`);
          if (res.ok) {
            const families: Family[] = await res.json();
            set({ families });
          }
        } catch (e) {
          console.error("Error fetching families:", e);
        }
      },
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        families: state.families,
        activeContext: state.activeContext,
        activeFamilyId: state.activeFamilyId,
        transactions: state.transactions,
      }),
    }
  )
);
