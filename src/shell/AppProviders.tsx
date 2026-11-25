import React from 'react';
import { AuthProvider, DownloadProvider, PlayerProvider } from '@/store';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AuthProvider>
    <DownloadProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </DownloadProvider>
  </AuthProvider>
);
