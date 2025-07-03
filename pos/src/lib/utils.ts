import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const currency = import.meta.env.VITE_CURRENCY || 'INR';
  const locale = import.meta.env.VITE_CURRENCY_LOCALE || 'en-IN';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
} 