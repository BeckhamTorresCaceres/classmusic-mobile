export type AudioFormat = 'mp3' | 'm4a';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  artists?: string[];
  collaborators?: string[];
  channel?: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
  url: string;
  viewCount?: number;
}

export interface DownloadedTrack extends Track {
  localUri: string;
  downloadedAt: number;
  fileSize?: number;
  format?: AudioFormat;
}

export interface ArtistRelease {
  title: string;
  type: 'album' | 'ep' | 'single';
  artist: string;
  year?: string;
  thumbnail?: string;
  tracks: Track[];
}

export interface SearchCatalog {
  tracks: Track[];
  albums: ArtistRelease[];
  artists: { name: string; thumbnail?: string }[];
}

export interface ArtistCatalog {
  artist: string;
  popular: Track[];
  albums: ArtistRelease[];
  singles: ArtistRelease[];
}

export interface User {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export type DownloadItemStatus =
  | 'queued'
  | 'downloading'
  | 'completed'
  | 'error';

export interface DownloadQueueItem {
  track: Track;
  format: AudioFormat;
  status: DownloadItemStatus;
  progress: number;
  error?: string;
}
