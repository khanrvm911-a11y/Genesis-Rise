import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dismissNativeLaunchSplash } from '../lib/launchSplash';

export default function LaunchSplashGate({ children }) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      dismissNativeLaunchSplash();
    }
  }, [loading]);

  return children;
}
