import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Debt, AppSettings, AchievementId, Achievement, Payment, PaymentStatus, SortOption } from './types';
import { loadState, saveState, resetToSeed } from './storage';
import { getSeedAchievements } from './seed';
import { generateId, daysSince, getTotalPaid, getRemainingAmount } from './utils';
import { ThemeColors } from './theme';
import { getTheme } from './theme';
import { ThemeMode } from './types';

interface AppContextValue {
  state: AppState;
  loading: boolean;
  colors: ThemeColors;
  debts: Debt[];
  activeDebts: Debt[];
  paidDebts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'payments' | 'remindersSent' | 'status'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  markAsPaid: (id: string) => void;
  addPayment: (id: string, amount: number, note?: string) => void;
  recordReminder: (id: string) => void;
  writeOffDebt: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  getDebtsByPerson: (name: string) => Debt[];
  sortDebts: (debts: Debt[], sort: SortOption) => Debt[];
  resetData: () => void;
  checkAchievements: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await loadState();
      setState(loaded);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  }, []);

  const colors = state ? getTheme(state.settings.themeMode) : getTheme('dark');

  const addDebt: AppContextValue['addDebt'] = useCallback((debt) => {
    updateState((prev) => {
      const newDebt: Debt = {
        ...debt,
        id: generateId(),
        payments: [],
        remindersSent: 0,
        status: 'outstanding',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...prev, debts: [newDebt, ...prev.debts] };
    });
  }, [updateState]);

  const updateDebt: AppContextValue['updateDebt'] = useCallback((id, updates) => {
    updateState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ),
    }));
  }, [updateState]);

  const deleteDebt: AppContextValue['deleteDebt'] = useCallback((id) => {
    updateState((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  }, [updateState]);

  const addPayment: AppContextValue['addPayment'] = useCallback((id, amount, note) => {
    updateState((prev) => {
      const debts = prev.debts.map((d) => {
        if (d.id !== id) return d;
        const payment: Payment = { id: generateId(), amount, date: new Date().toISOString(), note };
        const payments = [...d.payments, payment];
        const totalPaid = getTotalPaid(payments);
        const status: PaymentStatus = totalPaid >= d.amount ? 'paid' : 'partial';
        return { ...d, payments, status, updatedAt: new Date().toISOString() };
      });
      return { ...prev, debts };
    });
  }, [updateState]);

  const markAsPaid: AppContextValue['markAsPaid'] = useCallback((id) => {
    updateState((prev) => {
      const debts = prev.debts.map((d) => {
        if (d.id !== id) return d;
        const remaining = getRemainingAmount(d.amount, d.payments);
        if (remaining > 0) {
          const payment: Payment = { id: generateId(), amount: remaining, date: new Date().toISOString() };
          return { ...d, payments: [...d.payments, payment], status: 'paid' as const, updatedAt: new Date().toISOString() };
        }
        return { ...d, status: 'paid' as const, updatedAt: new Date().toISOString() };
      });
      return { ...prev, debts };
    });
  }, [updateState]);

  const recordReminder: AppContextValue['recordReminder'] = useCallback((id) => {
    updateState((prev) => {
      const debts = prev.debts.map((d) =>
        d.id === id
          ? { ...d, remindersSent: d.remindersSent + 1, lastReminderDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : d
      );
      return { ...prev, debts, remindersSentTotal: prev.remindersSentTotal + 1 };
    });
  }, [updateState]);

  const writeOffDebt: AppContextValue['writeOffDebt'] = useCallback((id) => {
    updateState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, status: 'written_off' as const, updatedAt: new Date().toISOString() } : d
      ),
    }));
  }, [updateState]);

  const updateSettings: AppContextValue['updateSettings'] = useCallback((updates) => {
    updateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, [updateState]);

  const toggleTheme: AppContextValue['toggleTheme'] = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        themeMode: prev.settings.themeMode === 'dark' ? 'light' : 'dark',
      },
    }));
  }, [updateState]);

  const getDebtsByPerson: AppContextValue['getDebtsByPerson'] = useCallback(
    (name) => {
      if (!state) return [];
      return state.debts.filter(
        (d) => d.personName.toLowerCase().includes(name.toLowerCase())
      );
    },
    [state]
  );

  const sortDebts: AppContextValue['sortDebts'] = useCallback((debts, sort) => {
    const sorted = [...debts];
    switch (sort) {
      case 'highest':
        return sorted.sort((a, b) => {
          const aVal = a.category === 'money' ? getRemainingAmount(a.amount, a.payments) : 0;
          const bVal = b.category === 'money' ? getRemainingAmount(b.amount, b.payments) : 0;
          return bVal - aVal;
        });
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'name':
        return sorted.sort((a, b) => a.personName.localeCompare(b.personName));
      case 'overdue':
        return sorted.sort((a, b) => {
          const aDays = daysSince(a.dateAdded);
          const bDays = daysSince(b.dateAdded);
          return bDays - aDays;
        });
      default:
        return sorted;
    }
  }, []);

  const resetData: AppContextValue['resetData'] = useCallback(async () => {
    const seed = await resetToSeed();
    setState(seed);
  }, []);

  const checkAchievements: AppContextValue['checkAchievements'] = useCallback(() => {
    updateState((prev) => {
      const achievements = [...prev.achievements];
      const debts = prev.debts;
      const totalDebts = debts.length;
      const totalMoneyTracked = debts
        .filter((d) => d.category === 'money')
        .reduce((sum, d) => sum + d.amount, 0);

      const unlock = (id: AchievementId) => {
        const idx = achievements.findIndex((a) => a.id === id);
        if (idx >= 0 && !achievements[idx].unlocked) {
          achievements[idx] = { ...achievements[idx], unlocked: true, unlockedDate: new Date().toISOString() };
        }
      };

      if (totalDebts >= 1) unlock('first_debt');
      if (totalDebts >= 10) unlock('debt_collector');
      if (prev.remindersSentTotal >= 10) unlock('persistent');
      if (totalMoneyTracked >= 100000) unlock('debt_lord');
      if (debts.some((d) => d.status === 'written_off')) unlock('charity_worker');
      if (debts.some((d) => d.status === 'paid' && d.remindersSent === 0)) unlock('miracle');
      if (debts.some((d) => daysSince(d.dateAdded) > 30 && d.status !== 'paid')) unlock('investigator');

      return { ...prev, achievements };
    });
  }, [updateState]);

  if (!state || loading) {
    return null;
  }

  const activeDebts = state.debts.filter((d) => d.status !== 'paid' && d.status !== 'written_off');
  const paidDebts = state.debts.filter((d) => d.status === 'paid');

  const value: AppContextValue = {
    state,
    loading: false,
    colors,
    debts: state.debts,
    activeDebts,
    paidDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    markAsPaid,
    addPayment,
    recordReminder,
    writeOffDebt,
    updateSettings,
    toggleTheme,
    getDebtsByPerson,
    sortDebts,
    resetData,
    checkAchievements,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useColors(): ThemeColors {
  return useApp().colors;
}
