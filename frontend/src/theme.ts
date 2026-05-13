import { useColorScheme } from 'react-native';

export const palette = {
  // Marca
  primaryDark: '#0D47A1',
  primary: '#1565C0',
  primaryLight: '#42A5F5',
  white: '#FFFFFF',

  // Status colors
  statusBlue: '#1976D2',
  statusOrange: '#F57C00',
  statusGreen: '#2E7D32',
  statusRed: '#C62828',

  // Verde para valores positivos (dashboard)
  positiveGreen: '#2E7D32',
  positiveGreenLight: '#66BB6A',
};

export type Theme = {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  border: string;
  divider: string;
  positive: string;
  danger: string;
  shadow: string;
  statusBlue: string;
  statusOrange: string;
  statusGreen: string;
  statusRed: string;
};

const lightTheme: Theme = {
  mode: 'light',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  primary: palette.primaryDark,
  primaryLight: palette.primaryLight,
  primaryDark: palette.primaryDark,
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#E5E7EB',
  positive: palette.positiveGreen,
  danger: '#C62828',
  shadow: 'rgba(13, 71, 161, 0.08)',
  statusBlue: palette.statusBlue,
  statusOrange: palette.statusOrange,
  statusGreen: palette.statusGreen,
  statusRed: palette.statusRed,
};

const darkTheme: Theme = {
  mode: 'dark',
  background: '#0A1628',
  surface: '#0F1F35',
  surfaceElevated: '#15263F',
  primary: palette.primaryLight,
  primaryLight: '#64B5F6',
  primaryDark: palette.primaryDark,
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  border: '#1E3251',
  divider: '#1E3251',
  positive: palette.positiveGreenLight,
  danger: '#EF5350',
  shadow: 'rgba(0, 0, 0, 0.3)',
  statusBlue: '#42A5F5',
  statusOrange: '#FFB74D',
  statusGreen: '#66BB6A',
  statusRed: '#EF5350',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export const themes = { light: lightTheme, dark: darkTheme };
