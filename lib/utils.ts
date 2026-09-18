import { CurrencyCode, Debt } from './types';

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'MWK', symbol: 'K', label: 'Malawian Kwacha' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '';
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${symbol}${formatted}`;
}

/**
 * Keeps amounts in their original currencies instead of adding unlike values
 * together (for example, MWK and USD). Useful for ledger summaries.
 */
export function formatTotalsByCurrency(
  debts: Debt[],
  amountFor: (debt: Debt) => number = (debt) => getRemainingAmount(debt.amount, debt.payments)
): string {
  return CURRENCIES.flatMap(({ code }) => {
    const total = debts
      .filter((debt) => debt.category === 'money' && debt.currency === code)
      .reduce((sum, debt) => sum + amountFor(debt), 0);
    return total > 0 ? [formatMoney(total, code)] : [];
  }).join('\n') || '—';
}

export function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#FFD93D',
    '#6BCB77',
    '#4D96FF',
    '#FF6B9D',
    '#C780FA',
    '#FF9F45',
    '#2EC4B6',
    '#E71D36',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function daysUntil(dateStr?: string): number {
  if (!dateStr) return 0;
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function daysOverdue(dueDate?: string, dateAdded?: string): number {
  if (dueDate) {
    const d = daysUntil(dueDate);
    return d < 0 ? Math.abs(d) : 0;
  }
  if (dateAdded) {
    return daysSince(dateAdded);
  }
  return 0;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeDate(dueDate?: string, dateAdded?: string): string {
  if (!dueDate && !dateAdded) return '';
  const days = dueDate ? daysUntil(dueDate) : daysSince(dateAdded!);

  if (dueDate) {
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days === -1) return '1 day overdue';
    if (days > 0) return `Due in ${days} days`;
    return `${Math.abs(days)} days overdue`;
  }

  if (days === 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  return `Added ${days} days ago`;
}

export function getRemainingAmount(amount: number, payments: { amount: number }[]): number {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, amount - totalPaid);
}

export function getTotalPaid(payments: { amount: number }[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function isFullyPaid(debt: { amount: number; payments: { amount: number }[] }): boolean {
  return getTotalPaid(debt.payments) >= debt.amount;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
