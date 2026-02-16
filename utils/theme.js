/**
 * Design tokens: Material You + minimalismo + app de futebol
 * UX moderna, microinterações fluidas
 */

export const COLORS = {
  // Surfaces (Material dark)
  surface: '#121212',
  surfaceContainer: '#1E1E1E',
  surfaceContainerHigh: '#2C2C2C',
  surfaceContainerHighest: '#383838',
  // Primary (verde campo - futebol)
  primary: '#22C55E',
  primaryContainer: 'rgba(34, 197, 94, 0.18)',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#052E16',
  // Secondary / outline
  outline: 'rgba(255, 255, 255, 0.12)',
  outlineVariant: 'rgba(255, 255, 255, 0.08)',
  // Text
  onSurface: '#FFFFFF',
  onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
  onSurfaceVariantMuted: 'rgba(255, 255, 255, 0.5)',
  // State
  error: '#EF4444',
  errorContainer: 'rgba(239, 68, 68, 0.18)',
  success: '#22C55E',
  // Tonal (time A vs B)
  teamA: 'rgba(34, 197, 94, 0.25)',
  teamB: 'rgba(59, 130, 246, 0.25)',
};

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const ELEVATION = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  titleLarge: { fontSize: 22, fontWeight: '600', letterSpacing: 0 },
  titleMedium: { fontSize: 18, fontWeight: '600', letterSpacing: 0.15 },
  titleSmall: { fontSize: 16, fontWeight: '600', letterSpacing: 0.1 },
  bodyLarge: { fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
  bodyMedium: { fontSize: 14, fontWeight: '400', letterSpacing: 0.25 },
  bodySmall: { fontSize: 12, fontWeight: '400', letterSpacing: 0.4 },
  labelLarge: { fontSize: 14, fontWeight: '500', letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
};
