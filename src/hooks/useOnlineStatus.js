import { useEffect } from 'react';
import { useUiStore } from '../store';

export const useOnlineStatus = () => {
  const { setOnlineStatus } = useUiStore();

  useEffect(() => {
    const handleOnline = () => setOnlineStatus('online');
    const handleOffline = () => setOnlineStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOnlineStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
};
