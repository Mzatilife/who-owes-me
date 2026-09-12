import { Debt } from './types';
import { formatMoney, getTotalPaid, getRemainingAmount, formatDate } from './utils';

export function debtsToCSV(debts: Debt[]): string {
  const headers = [
    'Person',
    'Description',
    'Category',
    'Amount',
    'Currency',
    'Paid',
    'Remaining',
    'Status',
    'Date Added',
    'Due Date',
    'Notes',
    'Phone',
  ];

  const rows = debts.map((d) => {
    const paid = getTotalPaid(d.payments);
    const remaining = getRemainingAmount(d.amount, d.payments);
    return [
      escapeCSV(d.personName),
      escapeCSV(d.description),
      d.category,
      d.amount.toString(),
      d.currency,
      paid.toString(),
      remaining.toString(),
      d.status,
      formatDate(d.dateAdded),
      d.dueDate ? formatDate(d.dueDate) : '',
      escapeCSV(d.notes ?? ''),
      escapeCSV(d.contactPhone ?? ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCSVShareText(debts: Debt[]): string {
  const totalOwed = debts.reduce((sum, d) => {
    if (d.status === 'paid' || d.category !== 'money') return sum;
    return sum + getRemainingAmount(d.amount, d.payments);
  }, 0);
  return debtsToCSV(debts);
}
