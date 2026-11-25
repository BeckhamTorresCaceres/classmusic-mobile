export const typography = {
  size: {
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    title: 20,
    hero: 24,
  },
  weight: {
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export type Typography = typeof typography;
