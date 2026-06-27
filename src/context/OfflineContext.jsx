import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { subscribe, getSyncState, processQueue, setupAutoSync, forceSyncAll, retryFailed, removeCompleted } from '../utils/syncEngine';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [state, setState] = useState(() => ({
    ...getSyncState(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }));
  const [syncToast, setSyncToast] = useState(null);
  const prevOnlineRef = useRef(state.isOnline);
  const prevQueueSize = useRef(state.queueSize);

  useEffect(() => {
    const unsub = subscribe(newState => {
      setState(prev => ({ ...prev, ...newState }));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const cleanup = setupAutoSync();
    return cleanup;
  }, []);

  useEffect(() => {
    const wasOffline = !prevOnlineRef.current;
    const isNowOnline = state.isOnline;
    prevOnlineRef.current = state.isOnline;

    if (isNowOnline && wasOffline) {
      setSyncToast({ type: 'syncing', message: 'Restoring your connection...' });
      setTimeout(() => {
        processQueue().then(result => {
          if (result && (result.synced > 0 || result.failed > 0)) {
            setSyncToast({ type: result.failed > 0 ? 'partial' : 'complete', message: result.failed > 0 ? `Synced ${result.synced} items (${result.failed} failed)` : 'All changes saved' });
          } else {
            setSyncToast({ type: 'complete', message: 'Everything is up to date' });
          }
          setTimeout(() => setSyncToast(null), 4000);
        });
      }, 500);
    }

    if (!isNowOnline && wasOffline === false) {
      setSyncToast({ type: 'offline', message: 'You are offline — changes will sync when reconnected' });
      setTimeout(() => setSyncToast(null), 4000);
    }
  }, [state.isOnline]);

  useEffect(() => {
    if (state.syncingCount > 0 && prevQueueSize.current !== state.queueSize) {
      setSyncToast(null);
    }
    prevQueueSize.current = state.queueSize;
  }, [state.queueSize, state.syncingCount]);

  const dismissToast = useCallback(() => setSyncToast(null), []);

  const value = {
    isOnline: state.isOnline,
    isSyncing: state.syncingCount > 0 || state.isProcessing,
    pendingCount: state.pendingCount,
    failedCount: state.failedCount,
    queueSize: state.queueSize,
    lastSyncTime: state.lastSyncTime,
    lastSyncResult: state.lastSyncResult,
    syncToast,
    dismissToast,
    forceSync: forceSyncAll,
    retryFailed,
    clearCompleted: removeCompleted,
    processQueue,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
