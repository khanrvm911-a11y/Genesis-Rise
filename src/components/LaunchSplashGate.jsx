import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dismissNativeLaunchSplash } from '../lib/launchSplash';
import GenesisLaunch from './GenesisLaunch';

export default function LaunchSplashGate({ children }) {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [ready, setReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(0);

  const handleFinish = useCallback(() => {
    setShowSplash(false);
    setContentOpacity(1);
    const t = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(t);
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
      <div
        style={{
          opacity: contentOpacity,
          transition: 'opacity 0.4s ease-out',
          position: showContent ? 'relative' : 'fixed',
          inset: 0,
          overflow: showContent ? '' : 'hidden',
          pointerEvents: showContent ? '' : 'none',
        }}
      >
        {children}
      </div>
    </>
  );
}
