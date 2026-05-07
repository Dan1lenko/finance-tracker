import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes conditionally and safely.
 * Solves the conflict between standard tailwind classes and dynamic overrides.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Повертає символ валюти за її кодом.
 * Функціональна парадигма: чиста функція без побічних ефектів.
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] ?? currency;
}

