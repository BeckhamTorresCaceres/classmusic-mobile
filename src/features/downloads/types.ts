import { Ionicons } from '@expo/vector-icons';

export type DownloadMode = 'album' | 'list' | 'single' | 'queue';
export type ListSubMode = 'text' | 'url';

export const LONG_TRACK_THRESHOLD_SECONDS = 900;

export const DOWNLOAD_MODE_TABS: {
  key: DownloadMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'album', label: 'Álbum', icon: 'disc-outline' },
  { key: 'list', label: 'Listas', icon: 'list-outline' },
  { key: 'single', label: 'Canción', icon: 'musical-note-outline' },
  { key: 'queue', label: 'Cola', icon: 'cloud-download-outline' },
];
