import { useEffect, useCallback } from 'react';
import { useUiStore, useAuthStore } from '../store';
import { getPendingSyncs, markSyncCompleted, markSyncFailed } from '../utils/dexie';
import api from '../api/axios';

export const useSync = () => {
  const { onlineStatus, setPendingSyncCount } = useUiStore();
  const { isAuthenticated } = useAuthStore();

  const processQueue = useCallback(async () => {
    if (!isAuthenticated || onlineStatus === 'offline') return;

    try {
      const pending = await getPendingSyncs();
      setPendingSyncCount(pending.length);

      if (pending.length === 0) return;

      useUiStore.getState().setOnlineStatus('syncing');

      // Process sequentially to maintain data integrity order
      for (const item of pending) {
        try {
          await api({
            method: item.method,
            url: item.endpoint,
            data: item.payload,
          });
          await markSyncCompleted(item.id);
        } catch (apiError) {
          console.error('Sync failed for item', item.id, apiError);
          // If it's a 4xx error (validation, etc.), maybe we don't retry.
          // For now, mark as failed if offline, or keep pending.
          if (!navigator.onLine) {
            break; // Stop processing if we went offline midway
          } else {
            // Unrecoverable server error? Mark failed to prevent blocking queue forever
            await markSyncFailed(item.id);
          }
        }
      }
    } finally {
      // Recheck pending
      const remaining = await getPendingSyncs();
      setPendingSyncCount(remaining.length);
      useUiStore.getState().setOnlineStatus(navigator.onLine ? 'online' : 'offline');
    }
  }, [isAuthenticated, onlineStatus]);

  // Initial check on mount OR when coming back online
  useEffect(() => {
    if (onlineStatus === 'online') {
      processQueue();
    }
  }, [onlineStatus, processQueue]);

  // Poll for pending count purely for UI display purposes
  useEffect(() => {
    const checkCount = async () => {
      const pending = await getPendingSyncs();
      setPendingSyncCount(pending.length);
    };
    checkCount();
    const interval = setInterval(checkCount, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [setPendingSyncCount]);

  return { processQueue };
};
