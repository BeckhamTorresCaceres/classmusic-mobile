export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  card: 16,
  modal: 20,
  full: 9999,
} as const;

export const layout = {
  tabBarHeight: 60,
  listBottomPadding: 120,
  listBottomPaddingWithCta: 175,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
