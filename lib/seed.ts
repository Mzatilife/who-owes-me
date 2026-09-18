import { AppState, Achievement } from './types';

export function getSeedAchievements(): Achievement[] {
  return [
    { id: 'first_debt', icon: '🏆', title: 'First Record', description: 'Your ledger has officially begun.', unlocked: false },
    { id: 'debt_collector', icon: '💰', title: 'Ledger Keeper', description: 'Track 10 records.', unlocked: false },
    { id: 'persistent', icon: '🔥', title: 'Persistent', description: 'Send 10 reminders.', unlocked: false },
    { id: 'charity_worker', icon: '💸', title: 'Charity Worker', description: 'Write off a debt.', unlocked: false },
    { id: 'debt_lord', icon: '👑', title: 'Big Picture', description: 'Track K100,000+ across your ledger.', unlocked: false },
    { id: 'miracle', icon: '🎉', title: 'No Nudge Needed', description: 'Settle a record without a reminder.', unlocked: false },
    { id: 'investigator', icon: '🕵️', title: 'Investigator', description: 'Track an open record for more than 30 days.', unlocked: false },
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
