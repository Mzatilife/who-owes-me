export type DebtCategory = 'money' | 'item' | 'food' | 'favour' | 'other';

export type DebtStatus = 'fresh' | 'remembering' | 'forgetting' | 'interesting' | 'disappeared' | 'charity' | 'written_off';

export type DebtHealth = 'healthy' | 'suspicious' | 'concerning' | 'critical' | 'terminal';

export type PaymentStatus = 'outstanding' | 'partial' | 'paid' | 'written_off';

export type CurrencyCode = 'MWK' | 'USD' | 'ZAR' | 'GBP' | 'EUR';

export type ThemeMode = 'light' | 'dark';

export type SortOption = 'highest' | 'oldest' | 'newest' | 'overdue' | 'name';

export type ReminderTone = 'friendly' | 'funny' | 'serious' | 'savage' | 'dramatic';

export type AchievementId =
  | 'first_debt'
  | 'debt_collector'
  | 'persistent'
  | 'charity_worker'
  | 'debt_lord'
  | 'miracle'
  | 'investigator';

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  personName: string;
  personAvatar?: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  category: DebtCategory;
  dateAdded: string;
  dueDate?: string;
  notes?: string;
  contactPhone?: string;
  payments: Payment[];
  status: PaymentStatus;
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: AchievementId;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface AppSettings {
  defaultCurrency: CurrencyCode;
  themeMode: ThemeMode;
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  userName: string;
  biometricEnabled: boolean;
}

export interface AppState {
  debts: Debt[];
  settings: AppSettings;
  achievements: Achievement[];
  remindersSentTotal: number;
}
