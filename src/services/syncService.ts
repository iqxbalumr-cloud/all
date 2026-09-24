import { db } from '../core/db';

export const syncService = {
  syncAttendance: async () => {
    try {
      // Find unsynced records
      const unsynced = await db.attendanceQueue
        .where('synced')
        .equals(0) // 0 is false in IndexedDB usually if stored as number, but we used boolean. 
                   // Dexie supports boolean but let's be safe.
        .toArray();

      if (unsynced.length === 0) return { success: true, count: 0 };

      const response = await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: unsynced })
      });

      if (!response.ok) throw new Error('Sync failed');

      const result = await response.json();

      // Mark as synced locally
      const ids = unsynced.map(r => r.id);
      await db.attendanceQueue.bulkUpdate(ids.map(id => ({
        key: id,
        changes: { synced: true }
      })));

      return { success: true, count: result.syncedCount };
    } catch (error) {
      console.error('Sync Error:', error);
      return { success: false, error };
    }
  },

  startAutoSync: (intervalMs = 30000) => {
    const interval = setInterval(() => {
      syncService.syncAttendance();
    }, intervalMs);
    return () => clearInterval(interval);
  }
};
