import React from 'react';
import { AppProviders } from './AppProviders';
import { MainShell } from './MainShell';

export const RootApp: React.FC = () => (
  <AppProviders>
    <MainShell />
  </AppProviders>
);
