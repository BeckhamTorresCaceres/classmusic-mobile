import { useCallback, useEffect, useState } from 'react';
import { MusicApi } from '@/services';

export type ServerHealthStatus = 'checking' | 'online' | 'offline';

export function useServerHealth() {
  const [healthStatus, setHealthStatus] =
    useState<ServerHealthStatus>('checking');
  const [ytdlpVer, setYtdlpVer] = useState('');

  const checkServer = useCallback(async () => {
    setHealthStatus('checking');
    try {
      const data = await MusicApi.checkHealth();
      setHealthStatus('online');
      setYtdlpVer(data.ytdlpVersion || 'OK');
    } catch {
      setHealthStatus('offline');
    }
  }, []);

  useEffect(() => {
    let active = true;
    MusicApi.checkHealth()
      .then((data) => {
        if (!active) return;
        setHealthStatus('online');
        setYtdlpVer(data.ytdlpVersion || 'OK');
      })
      .catch(() => {
        if (active) setHealthStatus('offline');
      });

    return () => {
      active = false;
    };
  }, []);

  return { healthStatus, ytdlpVer, checkServer };
}
