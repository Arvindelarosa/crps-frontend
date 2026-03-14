import Dexie from 'dexie';

export const db = new Dexie('CRPS_OfflineDB');

db.version(1).stores({
  syncQueue: '++id, endpoint, method, payload, timestamp, status', // status: 'pending' | 'failed'
});

export const addToSyncQueue = async (endpoint, method, payload) => {
  return await db.syncQueue.add({
    endpoint,
    method,
    payload,
    timestamp: new Date().getTime(),
    status: 'pending'
  });
};

export const getPendingSyncs = async () => {
  return await db.syncQueue.where('status').equals('pending').toArray();
};

export const markSyncCompleted = async (id) => {
  return await db.syncQueue.delete(id);
};

export const markSyncFailed = async (id) => {
  return await db.syncQueue.update(id, { status: 'failed' });
};

export const clearFailedSyncs = async () => {
  return await db.syncQueue.where('status').equals('failed').delete();
};
