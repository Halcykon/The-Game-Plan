/**
 * Design System Tokens
 * Based on "Serene Navigator" design system from stitch Design files
 */

export const colors = {
  // Primary (Sophisticated Teal)
  primary: '#2d6e6e',
  primaryDim: '#1d6262',
  primaryLight: '#4a9090',

  // Secondary (Cream & Earth)
  secondary: '#c8a882',
  secondaryLight: '#e8dcc8',

  // Surfaces & Backgrounds
  background: '#fffbff',
  surfaceContainerLow: '#f7f3eb',
  surfaceContainer: '#f0ebe3',
  surfaceContainerHigh: '#e8e3d8',
  surfaceContainerHighest: '#e0dbd0',
  surfaceContainerLowest: '#ffffff',
  surface: '#ffffff',
  surfaceBright: '#fffbff',

  // Text
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  onBackground: '#393831',
  onSurface: '#393831',

  // States
  success: '#166534',
  successLight: '#dcfce7',
  warning: '#92400e',
  warningLight: '#fef3c7',
  error: '#991b1b',
  errorLight: '#fee2e2',

  // Special
  outlineVariant: '#bcb9b0',
  border: '#e2e8f0',
} as const;

export const colorsDark = {
  // Dark mode adjustments
  primary: '#4a9090',
  primaryDim: '#2d6e6e',
  primaryLight: '#6eb3b3',

  background: '#121212',
  surfaceContainer: '#1e1e1e',
  surfaceContainerLow: '#161616',
  surfaceContainerHighest: '#262626',
  surface: '#1e1e1e',
  surfaceBright: '#333333',

  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#64748b',
  onBackground: '#f1f5f9',

  border: '#404040',
} as const;

export const typography = {
  displayLarge: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 64,
    letterSpacing: -0.02,
  },
  displayMedium: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 52,
    letterSpacing: -0.02,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
  },

  headlineLarge: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
  },
  headlineMedium: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  headlineSmall: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },

  titleLarge: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999, // 50% in RN
} as const;

export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
  },
  sm: {
    elevation: 2,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  md: {
    elevation: 4,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  lg: {
    elevation: 8,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  xl: {
    elevation: 12,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
  },
} as const;

// Component-specific styles

export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.surfaceContainerLowest,
  },
  secondary: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.primary,
  },
  tertiary: {
    backgroundColor: 'transparent',
    color: colors.primary,
  },
} as const;

export const inputStyles = {
  borderRadius: borderRadius.xl,
  backgroundColor: colors.surfaceContainerLowest,
  borderColor: colors.border,
  borderWidth: 1,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  minHeight: 48, // Accessible touch target
} as const;

export const cardStyles = {
  backgroundColor: colors.surfaceContainerLowest,
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  ...shadows.sm,
} as const;

export const chipStyles = {
  borderRadius: borderRadius.full,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
  minHeight: 32,
} as const;

// Fonts
export const fonts = {
  display: 'Fraunces_900Black', // Display headlines
  body: 'SourceSans3_400Regular', // Body text
  bodyBold: 'SourceSans3_700Bold',
  bodyExtraBold: 'SourceSans3_800ExtraBold',
} as const;
