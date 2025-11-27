/**
 * Tailwind Theme Configuration
 * Learn English App - Color & Typography Reference
 *
 * Usage: Copy relevant sections to tailwind.config.ts
 */

export const colors = {
  // Primary
  primary: {
    DEFAULT: '#6366F1',
    dark: '#4F46E5',
    light: '#818CF8',
    50: '#EEF2FF',
  },

  // Accent Colors
  accent: {
    orange: '#F97316',
    'orange-bg': '#FFF7ED',
    purple: '#A855F7',
    'purple-bg': '#F3E8FF',
  },

  // Semantic
  success: '#22C55E',

  // Neutrals
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',

  // Text
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
};

export const fontFamily = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
};

export const fontSize = {
  'page-title': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
  'section': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
  'card-word': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
  'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
  'phonetic': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],
  'badge': ['0.75rem', { lineHeight: '1', fontWeight: '500' }],
};

export const borderRadius = {
  card: '12px',
  badge: '9999px', // full
  button: '8px',
};

export const spacing = {
  'card-padding': '12px',
  'card-gap': '16px',
  'section-gap': '24px',
};

export const boxShadow = {
  card: '0 1px 3px rgba(0, 0, 0, 0.05)',
  'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07)',
};

// Header gradient for custom CSS
export const gradients = {
  header: 'linear-gradient(135deg, #1E3A8A 0%, #6366F1 50%, #A855F7 100%)',
};

/**
 * Status Badge Variants (for shadcn/ui Badge component)
 */
export const badgeVariants = {
  new: {
    className: 'bg-accent-purple-bg text-accent-purple',
    label: 'Moi',
  },
  learning: {
    className: 'bg-accent-orange-bg text-accent-orange',
    label: 'Dang hoc',
  },
  reviewed: {
    className: 'bg-primary-50 text-primary',
    label: 'On tap',
  },
  mastered: {
    className: 'bg-green-50 text-success',
    label: 'Da thuoc',
  },
};

/**
 * Example tailwind.config.ts integration:
 *
 * import type { Config } from 'tailwindcss'
 * import { colors, fontFamily, fontSize } from './docs/tailwind-theme-config'
 *
 * const config: Config = {
 *   theme: {
 *     extend: {
 *       colors,
 *       fontFamily,
 *       fontSize,
 *     },
 *   },
 * }
 * export default config
 */
