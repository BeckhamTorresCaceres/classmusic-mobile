import { Ionicons } from '@expo/vector-icons';

export type TabType = 'search' | 'downloads' | 'local' | 'settings';

export interface TabRouteItem {
  key: TabType;
  label: string;
  subtitle: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

export const TAB_ROUTES: TabRouteItem[] = [
  {
    key: 'search',
    label: 'Explorar',
    subtitle: 'Explorar canciones',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  {
    key: 'downloads',
    label: 'Descargas',
    subtitle: 'Descargar canciones, álbumes o listas',
    activeIcon: 'cloud-download',
    inactiveIcon: 'cloud-download-outline',
  },
  {
    key: 'local',
    label: 'Local',
    subtitle: 'Biblioteca guardada sin conexión',
    activeIcon: 'library',
    inactiveIcon: 'library-outline',
  },
  {
    key: 'settings',
    label: 'Ajustes',
    subtitle: 'Ajustes del servidor',
    activeIcon: 'settings-sharp',
    inactiveIcon: 'settings-outline',
  },
];
