import { ThemeMode } from './types';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  card: string;
  cardElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  shadow: string;
  shadowOpacity: number;
}

export const lightTheme: ThemeColors = {
  bg: '#F8FAFC',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#EEEEF3',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  primary: '#059669',
  primaryLight: '#ECFDF5',
  primaryDark: '#047857',
  accent: '#14B8A6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
  shadowOpacity: 0.08,
};

export const darkTheme: ThemeColors = {
  bg: '#020617',
  bgSecondary: '#0F172A',
  bgTertiary: '#1E293B',
  card: '#0F172A',
  cardElevated: '#111827',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#1E293B',
  borderLight: '#1E293B',
  primary: '#34D399',
  primaryLight: '#052E2B',
  primaryDark: '#10B981',
  accent: '#2DD4BF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '#000000',
  shadowOpacity: 0.3,
};

export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkTheme : lightTheme;
}
