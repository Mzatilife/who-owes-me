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
  bg: '#FFFCF5',
  bgSecondary: '#FFF9EA',
  bgTertiary: '#F5EBD3',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#251A08',
  textSecondary: '#6B572B',
  textTertiary: '#A38A50',
  textInverse: '#FFFFFF',
  border: '#E8D8B3',
  borderLight: '#F7EEDC',
  primary: '#A9791B',
  primaryLight: '#FFF3D4',
  primaryDark: '#6E470B',
  accent: '#D3A33C',
  success: '#A9791B',
  warning: '#D78D16',
  danger: '#B54836',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
  shadowOpacity: 0.08,
};

export const darkTheme: ThemeColors = {
  bg: '#161109',
  bgSecondary: '#211A0E',
  bgTertiary: '#342814',
  card: '#211A0E',
  cardElevated: '#2A2113',
  text: '#FFF8E8',
  textSecondary: '#E3D1A5',
  textTertiary: '#B7A277',
  textInverse: '#FFFFFF',
  border: '#44351D',
  borderLight: '#342814',
  primary: '#E3B957',
  primaryLight: '#3A2A0C',
  primaryDark: '#B88628',
  accent: '#F2D27F',
  success: '#E3B957',
  warning: '#F0AE3F',
  danger: '#E47A65',
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '#000000',
  shadowOpacity: 0.3,
};

export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkTheme : lightTheme;
}
