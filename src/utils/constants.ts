export const NOVA_BRAND = {
  name: 'NovaBrowser',
  slogan: 'The Browser of the Nova Ecosystem',
} as const

export const NOVA_COLORS = {
  background: '#0B0D12',
  surface: '#12151C',
  surfaceElevated: '#1A1F2B',
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  textPrimary: '#F4F6FB',
  textSecondary: '#9AA3B5',
  textMuted: '#6B7385',
  accent: '#7C8CFF',
  accentSoft: '#6EE7FF',
  accentWarm: '#C084FC',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
} as const

export const NOVA_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const

export const NOVA_RADIUS = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const

export const NOVA_MOTION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  spring: { type: 'spring' as const, stiffness: 380, damping: 32 },
} as const

export const ECOSYSTEM_MODULES = [
  'NovaCloud',
  'NovaDrop',
  'Ryuk AI',
  'NovaDocs',
  'NovaStudio',
  'NovaOS',
] as const
