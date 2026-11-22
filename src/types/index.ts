export interface Track {
  id: string;
  title: string;
  artist?: string;
  artists?: string[];
  collaborators?: string[];
  channel?: string;
  duration?: number;
  thumbnail?: string;
  url: string;
  viewCount?: number;
}

export interface DownloadedTrack extends Track {
  localUri: string;
  downloadedAt: number;
  fileSize?: number;
}

export interface User {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export interface DownloadProgress {
  trackId: string;
  progress: number; // 0 to 1
  isDownloading: boolean;
  error?: string;
}
