export type LocalSortOption = 'recent' | 'title' | 'artist' | 'size';

export const LOCAL_SORT_OPTIONS: {
  key: LocalSortOption;
  label: string;
}[] = [
  { key: 'recent', label: 'Recientes' },
  { key: 'title', label: 'A-Z' },
  { key: 'artist', label: 'Artista' },
  { key: 'size', label: 'Tamaño' },
];
