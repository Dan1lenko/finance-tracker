import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, TransactionType, Family as PrismaFamily, User } from '@prisma/client';
import { calculateBalance, getExpensesByCategory } from '@/lib/logic/finance';
import { toast } from 'sonner';

interface Family extends PrismaFamily {
  members?: User[];
  ownerId: string | null;
}

/**
 * Демонстрація Реактивної Парадигми
 * 
 * 1. Єдине джерело істини (Single Source of Truth): Сховище (store) тримає глобальний стан.
 * 2. Реактивність (Reactivity): Компоненти підписуються на зміни стану і автоматично перемальовуються.
 * 3. Односпрямований потік даних (Unidirectional Data Flow): Actions -> Оновлення стану -> Оновлення UI.
 */

type ContextType = 'PERSONAL' | 'FAMILY';

interface FinanceState {
  // Global Data
  transactions: Transaction[];
  families: Family[];
  currentUser: User | null; // Null if not logged in
  
  // UI State
  activeContext: ContextType;
  activeFamilyId: string | null;

  // Derived State (Computed)
  balances: Record<string, number>;
  expensesByCategory: Record<string, Record<string, number>>;
  
  // Дії (Actions)
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, name: string, password: string) => Promise<void>;
  addMemberToFamily: (familyId: string, email: string) => Promise<void>;
  removeMemberFromFamily: (familyId: string, memberId: string) => Promise<void>;
  deleteFamily: (familyId: string) => Promise<void>;
  renameFamily: (familyId: string, name: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  createFamily: (name: string) => Promise<void>;
  setActiveContext: (context: ContextType, familyId?: string) => void;
  // Helper
  _recalculate: (state: Pick<FinanceState, 'transactions' | 'activeContext' | 'activeFamilyId' | 'currentUser'>) => {
    balances: Record<string, number>;
    expensesByCategory: Record<string, Record<string, number>>;
  };
  _fetchTransactions: () => Promise<void>;
  _fetchFamilies: () => Promise<void>;
}

// Mock User removed, strictly defined in actions now

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      families: [],
      currentUser: null, // Start as logged out
      
      activeContext: 'PERSONAL',
      activeFamilyId: null,

      balances: {},
      expensesByCategory: {},

      // Helper
      _recalculate: (state) => {
        if (!state.currentUser) return { balances: {}, expensesByCategory: {} };
        
        const filteredTransactions = state.transactions.filter(t => {
          if (state.activeContext === 'PERSONAL') {
            return t.userId === state.currentUser?.id;
          } else {
            return t.familyId === state.activeFamilyId;
          }
        });
        return {
          balances: calculateBalance(filteredTransactions),
          expensesByCategory: getExpensesByCategory(filteredTransactions)
        };
      },

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
            // Fetch transactions for this user
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
        set(() => ({
          currentUser: null,
          activeContext: 'PERSONAL',
          activeFamilyId: null,
          transactions: [],
          families: []
        }));
        // Optional: clear local storage specifically if needed, but simple set null is usually enough for logic
        // localStorage.removeItem('finance-storage'); 
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
            // Auto login after register logic (reuse login or just fetch)
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
              )
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
              )
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
                    activeFamilyId: null
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
                    families: state.families.map(f => f.id === familyId ? { ...f, name: updatedFamily.name } : f)
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
        const state = get();
        // Optimistic update — fallback UUID for HTTP/older browsers
        const tempId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random()*16)|0; return (c==='x'?r:(r&0x3)|0x8).toString(16); });
        const optimisticTransaction = { ...transaction, id: tempId };
        
        set((state) => {
           const newTransactions = [...state.transactions, optimisticTransaction];
           const derived = state._recalculate({ ...state, transactions: newTransactions } as any);
           return { transactions: newTransactions, ...derived };
        });

        try {
          const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: transaction.amount,
              currency: (transaction as any).currency,
              type: transaction.type,
              category: transaction.category,
              userId: transaction.userId,
              familyId: transaction.familyId
            }),
          });

          if (res.ok) {
            const savedTransaction = await res.json();
            // Replace optimistic with real
            set((state) => {
               const newTransactions = state.transactions.map(t => t.id === tempId ? savedTransaction : t);
               const derived = state._recalculate({ ...state, transactions: newTransactions } as any);
               return { transactions: newTransactions, ...derived };
            });
          }
        } catch (e) {
          console.error(e);
          // Revert on error could be implemented here
        }
      },

      removeTransaction: async (id) => {
        // 1. Optimistic — remove from UI immediately
        set((state) => {
          const newTransactions = state.transactions.filter((t) => t.id !== id);
          const derived = state._recalculate({ ...state, transactions: newTransactions } as any);
          return { transactions: newTransactions, ...derived };
        });

        // 2. Delete from database
        try {
          const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || "Помилка видалення");
            // Revert — re-fetch to restore correct state
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
            set((state) => ({
              families: [...state.families, newFamily]
            }));
          }
        } catch (e) {
          console.error(e);
          alert("Помилка створення групи");
        }
      },

      setActiveContext: (context, familyId) => {
        set((state) => {
          const nextState = {
             ...state,
             activeContext: context,
             activeFamilyId: familyId || null
          };
          // Fetch data for context? Logic handles filtering on client for now, 
          // but in real app we might fetch per context if data is huge.
          // Current logical: We fetch all user related transactions on login.
          const derived = state._recalculate(nextState);
          return { ...nextState, ...derived };
        });
      },

      // Internal helper to fetch data
      _fetchTransactions: async () => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        try {
          const fetchPromises = [
            // 1. Fetch personal transactions
            fetch(`/api/transactions?userId=${user.id}`).then(r => r.ok ? r.json() : []),
            // 2. Fetch transactions for each family
            ...state.families.map(f => 
              fetch(`/api/transactions?familyId=${f.id}`).then(r => r.ok ? r.json() : [])
            )
          ];

          const results = await Promise.all(fetchPromises);
          
          // Flatten results into one array
          const allTransactions = results.flat();

          // Remove duplicates based on ID (just in case)
          const uniqueTransactions = Array.from(
            new Map(allTransactions.map(t => [t.id, t])).values()
          );

          set((s) => {
             const derived = s._recalculate({ ...s, transactions: uniqueTransactions } as any);
             return { transactions: uniqueTransactions, ...derived };
          });
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
            const families = await res.json();
            set({ families });
          }
        } catch (e) {
          console.error("Error fetching families:", e);
        }
      }
    }),
    {
      name: 'finance-storage', // unique name
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
