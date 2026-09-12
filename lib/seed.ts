import { AppState, Achievement } from './types';

export function getSeedAchievements(): Achievement[] {
  return [
    { id: 'first_debt', icon: '🏆', title: 'First Debt', description: 'Someone owes you money. Congratulations?', unlocked: false },
    { id: 'debt_collector', icon: '💰', title: 'Debt Collector', description: 'Track 10 debts.', unlocked: false },
    { id: 'persistent', icon: '🔥', title: 'Persistent', description: 'Send 10 reminders.', unlocked: false },
    { id: 'charity_worker', icon: '💸', title: 'Charity Worker', description: 'Write off a debt.', unlocked: false },
    { id: 'debt_lord', icon: '👑', title: 'Debt Lord', description: 'Track K100,000+ in total debts.', unlocked: false },
    { id: 'miracle', icon: '🎉', title: 'Miracle', description: 'Someone paid without being reminded.', unlocked: false },
    { id: 'investigator', icon: '🕵️', title: 'Investigator', description: 'Track a debt for more than 30 days.', unlocked: false },
  ];
}

export function getSeedState(): AppState {
  return {
    debts: [],
    settings: {
      defaultCurrency: 'MWK',
      themeMode: 'dark',
      reminderFrequency: 'weekly',
      userName: '',
      biometricEnabled: false,
    },
    achievements: getSeedAchievements(),
    remindersSentTotal: 0,
    onboardingComplete: false,
  };
}
