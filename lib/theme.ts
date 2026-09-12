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
  bg: '#F7F7FA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#EEEEF3',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#5C5C6F',
  textTertiary: '#9E9EAE',
  textInverse: '#FFFFFF',
  border: '#E5E5EC',
  borderLight: '#F0F0F5',
  primary: '#4F46E5',
  primaryLight: '#EEF0FF',
  primaryDark: '#3730A3',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
  shadowOpacity: 0.08,
};

export const darkTheme: ThemeColors = {
  bg: '#0F0F1A',
  bgSecondary: '#1A1A2E',
  bgTertiary: '#252538',
  card: '#1E1E32',
  cardElevated: '#252538',
  text: '#F5F5F7',
  textSecondary: '#A0A0B8',
  textTertiary: '#6B6B7F',
  textInverse: '#1A1A2E',
  border: '#2E2E42',
  borderLight: '#252538',
  primary: '#818CF8',
  primaryLight: '#312E81',
  primaryDark: '#6366F1',
  accent: '#FBBF24',
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
