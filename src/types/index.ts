import { Transaction, Family as PrismaFamily, User } from '@prisma/client';

// ─── Context ───────────────────────────────────────────────────────────────

export type ContextType = 'PERSONAL' | 'FAMILY';

// ─── Domain Models ─────────────────────────────────────────────────────────

/**
 * Розширена модель Family з учасниками (members не включені в Prisma за замовчуванням).
 */
export interface Family extends PrismaFamily {
  members?: User[];
  ownerId: string | null;
}

/**
 * Transaction з додатковим полем currency (зберігається в базі, але відсутнє в Prisma schema як окреме поле).
 */
export type TransactionWithCurrency = Transaction & {
  currency?: string;
};

// ─── Form Data ─────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  name: string;
  password: string;
}

export interface TransactionFormData {
  amount: string;
  currency: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
}

// ─── Store State ───────────────────────────────────────────────────────────

export interface FinanceState {
  // Global Data
  transactions: Transaction[];
  families: Family[];
  currentUser: User | null;

  // UI State
  activeContext: ContextType;
  activeFamilyId: string | null;

  // Derived State (Computed)
  balances: Record<string, number>;
  expensesByCategory: Record<string, Record<string, number>>;

  // Actions
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

  // Data fetching actions (used by StoreInitializer for polling)
  _fetchTransactions: () => Promise<void>;
  _fetchFamilies: () => Promise<void>;
}
