/**
 * Única fuente de verdad para todos los colores de ClassMusic.
 * Roles semánticos para garantizar consistencia visual en toda la app.
 */
export const colors = {
  // Marca y acciones principales
  primary: '#22c55e',
  primaryForeground: '#09090b',
  primaryForegroundDark: '#000',

  // Fondos y superficies
  background: '#09090b',
  tabBarBackground: '#121215',
  surface: '#18181b',
  surfaceActive: '#1c1917',
  surfaceSelected: '#141f18',
  surfaceElevated: '#27272a',

  // Bordes y divisores
  border: '#27272a',
  borderSubtle: '#18181b',
  borderWarm: '#292524',
  borderStrong: '#3f3f46',
  borderControl: '#52525b',

  // Textos e íconos
  textPrimary: '#fff',
  textBright: '#f4f4f5',
  textLight: '#e4e4e7',
  textBody: '#d4d4d8',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  iconMuted: '#52525b',
  iconDim: '#3f3f46',

  // Estados semánticos
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',

  // Sombras y base oscura
  shadow: '#000',
} as const;

export type Colors = typeof colors;

/**
 * Convierte un color hexadecimal (#RGB o #RRGGBB) a rgba() con la opacidad dada.
 */
export function withOpacity(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
