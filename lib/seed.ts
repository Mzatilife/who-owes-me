import { Debt, AppState, Achievement } from './types';

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysAhead(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function getSeedDebts(): Debt[] {
  return [
    {
      id: 'seed-1',
      personName: 'John Banda',
      amount: 5000,
      currency: 'MWK',
      description: 'Cash loan',
      category: 'money',
      dateAdded: daysAgo(15),
      dueDate: daysAgo(3),
      notes: 'Said he\'d pay back "next week". That was two weeks ago.',
      contactPhone: '+265 991 234 567',
      payments: [],
      status: 'outstanding',
      remindersSent: 2,
      lastReminderDate: daysAgo(5),
      createdAt: daysAgo(15),
      updatedAt: daysAgo(15),
    },
    {
      id: 'seed-2',
      personName: 'Peter Phiri',
      amount: 0,
      currency: 'MWK',
      description: 'One lunch',
      category: 'food',
      dateAdded: daysAgo(2),
      dueDate: daysAhead(1),
      notes: 'Promised to buy me lunch next time.',
      payments: [],
      status: 'outstanding',
      remindersSent: 0,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'seed-3',
      personName: 'Brian Mwale',
      amount: 2500,
      currency: 'MWK',
      description: 'Cash for transport',
      category: 'money',
      dateAdded: daysAgo(35),
      dueDate: daysAgo(20),
      notes: 'Has not responded to any messages since.',
      contactPhone: '+265 888 123 456',
      payments: [{ id: 'p1', amount: 500, date: daysAgo(10) }],
      status: 'partial',
      remindersSent: 4,
      lastReminderDate: daysAgo(7),
      createdAt: daysAgo(35),
      updatedAt: daysAgo(10),
    },
    {
      id: 'seed-4',
      personName: 'Sarah Nyasulu',
      amount: 10000,
      currency: 'MWK',
      description: 'Business investment',
      category: 'money',
      dateAdded: daysAgo(45),
      dueDate: daysAgo(10),
      notes: 'Should be reliable. We shall see.',
      payments: [{ id: 'p2', amount: 10000, date: daysAgo(8) }],
      status: 'paid',
      remindersSent: 0,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(8),
    },
    {
      id: 'seed-5',
      personName: 'Mike Chirwa',
      amount: 0,
      currency: 'MWK',
      description: 'Buy me a Coke',
      category: 'favour',
      dateAdded: daysAgo(8),
      dueDate: daysAhead(3),
      notes: 'Small favour, but principles matter.',
      payments: [],
      status: 'outstanding',
      remindersSent: 1,
      lastReminderDate: daysAgo(3),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    {
      id: 'seed-6',
      personName: 'Grace Tembo',
      amount: 1500,
      currency: 'MWK',
      description: 'My phone charger',
      category: 'item',
      dateAdded: daysAgo(20),
      dueDate: daysAgo(5),
      notes: 'She said she\'d return it "tomorrow". Classic.',
      payments: [],
      status: 'outstanding',
      remindersSent: 2,
      lastReminderDate: daysAgo(4),
      createdAt: daysAgo(20),
      updatedAt: daysAgo(20),
    },
    {
      id: 'seed-7',
      personName: 'Daniel Banda',
      amount: 12000,
      currency: 'MWK',
      description: 'Rent help',
      category: 'money',
      dateAdded: daysAgo(50),
      dueDate: daysAgo(30),
      notes: 'This one hurts.',
      contactPhone: '+265 992 555 123',
      payments: [{ id: 'p3', amount: 3000, date: daysAgo(15) }],
      status: 'partial',
      remindersSent: 5,
      lastReminderDate: daysAgo(2),
      createdAt: daysAgo(50),
      updatedAt: daysAgo(15),
    },
  ];
}

export function getSeedAchievements(): Achievement[] {
  return [
    { id: 'first_debt', icon: '🏆', title: 'First Debt', description: 'Someone owes you money. Congratulations?', unlocked: false },
    { id: 'debt_collector', icon: '💰', title: 'Debt Collector', description: 'Track 10 debts.', unlocked: false },
    { id: 'persistent', icon: '🔥', title: 'Persistent', description: 'Send 10 reminders.', unlocked: false },
    { id: 'charity_worker', icon: '💀', title: 'Charity Worker', description: 'Write off a debt.', unlocked: false },
    { id: 'debt_lord', icon: '👑', title: 'Debt Lord', description: 'Track K100,000+ in total debts.', unlocked: false },
    { id: 'miracle', icon: '🎉', title: 'Miracle', description: 'Someone paid without being reminded.', unlocked: false },
    { id: 'investigator', icon: '🕵️', title: 'Investigator', description: 'Track a debt for more than 30 days.', unlocked: false },
  ];
}

export function getSeedState(): AppState {
  return {
    debts: getSeedDebts(),
    settings: {
      defaultCurrency: 'MWK',
      themeMode: 'dark',
      reminderFrequency: 'weekly',
      userName: 'Mahala',
      biometricEnabled: false,
    },
    achievements: getSeedAchievements(),
    remindersSentTotal: 0,
  };
}
