import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(30 33% 98%)', // background
    border: 'hsl(30 18% 88%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(0 78% 52%)', // destructive
    primary: 'hsl(24 80% 48%)', // primary
    text: 'hsl(24 30% 12%)', // foreground
  },
  dark: {
    background: 'hsl(24 18% 8%)', // background
    border: 'hsl(24 12% 20%)', // border
    card: 'hsl(24 16% 12%)', // card
    notification: 'hsl(0 72% 56%)', // destructive
    primary: 'hsl(24 82% 56%)', // primary
    text: 'hsl(30 25% 96%)', // foreground
  },
};

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.dark,
};
