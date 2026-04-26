import { Transaction, TransactionType } from "@prisma/client";

/**
 * Демонстрація Функціональної Парадигми
 * 
 * 1. Чисті функції (Pure Functions): Ці функції залежать лише від своїх вхідних даних і не мають побічних ефектів.
 * 2. Незмінність (Immutability): Дані розглядаються як незмінні. Ми створюємо нові значення замість модифікації існуючих.
 * 3. Функції вищого порядку (Higher-Order Functions): Широке використання .filter, .reduce, .map для декларативної обробки даних.
 */

// Визначення явних типів, якщо типів Prisma недостатньо або для розв'язки
type FinancialTransaction = Pick<Transaction, "amount" | "type" | "category" | "date">;

/**
 * Розраховує загальний баланс зі списку транзакцій по валютах.
 */
export const calculateBalance = (transactions: FinancialTransaction[]): Record<string, number> => {
  return transactions.reduce((acc, transaction) => {
    const currency = (transaction as any).currency || "UAH";
    const currentBalance = acc[currency] || 0;
    
    const newBalance = transaction.type === "INCOME" 
      ? currentBalance + transaction.amount 
      : currentBalance - transaction.amount;
      
    return { ...acc, [currency]: newBalance };
  }, {} as Record<string, number>);
};

/**
 * Групує витрати за категоріями та сумує їх (по валютах).
 * Повертає: Currency -> Category -> Amount
 */
export const getExpensesByCategory = (transactions: FinancialTransaction[]): Record<string, Record<string, number>> => {
  return transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const currency = (t as any).currency || "UAH";
      const currencyGroup = acc[currency] || {};
      const currentAmount = currencyGroup[t.category] || 0;
      
      return {
        ...acc,
        [currency]: {
          ...currencyGroup,
          [t.category]: currentAmount + t.amount
        }
      };
    }, {} as Record<string, Record<string, number>>);
};
