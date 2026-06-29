import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dismissNativeLaunchSplash } from '../lib/launchSplash';
import GenesisLaunch from './GenesisLaunch';

export default function LaunchSplashGate({ children }) {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [ready, setReady] = useState(false);

  const handleFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      dismissNativeLaunchSplash();
      const t = setTimeout(() => setReady(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <>
      {showSplash && (
        <GenesisLaunch onFinish={handleFinish} loading={!ready} />
      )}
      <div style={{ display: showSplash ? 'none' : '' }}>
        {children}
      </div>
    </>
  );
}
