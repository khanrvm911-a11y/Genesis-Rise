import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  getLevelTitle,
} from '../utils/workoutUtils';

const LevelContext = createContext();

const readStoredXP = () => {
  const stored = parseInt(localStorage.getItem('sl_user_xp') || '0', 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
};

const applyXP = (setXp, setLevel, nextXP) => {
  const safeXP = Math.max(0, nextXP);
  setXp(safeXP);
  setLevel(calculateLevelFromXP(safeXP));
};

export const LevelProvider = ({ children }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [xpForNext, setXpForNext] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  const xpRef = useRef(0);
  useEffect(() => {
    xpRef.current = xp;
  }, [xp]);

  const mergeRemoteXP = useCallback((remoteXP) => {
    const safeRemote = remoteXP ?? 0;
    const merged = Math.max(xpRef.current, safeRemote);
    applyXP(setXp, setLevel, merged);
    return merged;
  }, []);

  const fetchProfile = useCallback(async ({ isInitial = false } = {}) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('level, xp')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        mergeRemoteXP(data.xp);
      } else {
        const startingXP = isInitial ? readStoredXP() : xpRef.current;
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || '',
          level: calculateLevelFromXP(startingXP),
          xp: startingXP,
          rank: getLevelTitle(calculateLevelFromXP(startingXP)),
        });
        applyXP(setXp, setLevel, startingXP);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [user, mergeRemoteXP]);

  useEffect(() => {
    if (!user) {
      applyXP(setXp, setLevel, 0);
      setHydrated(false);
      setLoading(false);
      return;
    }

    const storedXP = readStoredXP();
    if (storedXP > 0) {
      applyXP(setXp, setLevel, storedXP);
    }

    setHydrated(false);
    setLoading(true);
    fetchProfile({ isInitial: true }).finally(() => {
      setHydrated(true);
      setLoading(false);
    });
  }, [user, fetchProfile]);

  // Cross-tab sync: refetch XP when tab becomes visible
  useEffect(() => {
    if (!user || !hydrated) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, hydrated, fetchProfile]);

  // Online sync: refetch when coming back online
  useEffect(() => {
    if (!user || !hydrated) return;
    const handleOnline = () => fetchProfile();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, hydrated, fetchProfile]);

  // Cross-tab sync via localStorage changes in other tabs
  useEffect(() => {
    if (!user) return;
    const handleStorage = (event) => {
      if (event.key !== 'sl_user_xp' || event.newValue == null) return;
      const remoteXP = parseInt(event.newValue, 10);
      if (!Number.isFinite(remoteXP)) return;
      mergeRemoteXP(remoteXP);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, mergeRemoteXP]);

  useEffect(() => {
    const p = getLevelProgress(xp, level);
    setProgress(p);
    setXpForNext(getXPForNextLevel(level));
  }, [xp, level]);

  const persistProfile = useCallback(async () => {
    if (!user) return;
    const computedLevel = calculateLevelFromXP(xp);
    try {
      await supabase
        .from('profiles')
        .update({ xp, level: computedLevel, rank: getLevelTitle(computedLevel) })
        .eq('id', user.id);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }, [xp, user]);

  // Only persist after initial hydration to avoid overwriting DB with stale defaults
  useEffect(() => {
    if (!user || !hydrated) return;
    persistProfile();
  }, [xp, user, hydrated, persistProfile]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem('sl_user_xp', String(xp));
    localStorage.setItem('sl_user_level', String(level));
  }, [xp, level, user]);

  const addXP = useCallback((amount) => {
    if (amount <= 0) return;

    setXp(prev => {
      const newXP = prev + amount;
      const currentLevel = calculateLevelFromXP(prev);
      const nextLevel = calculateLevelFromXP(newXP);

      if (nextLevel > currentLevel) {
        setNewLevel(nextLevel);
        setJustLeveledUp(true);
        setLevel(nextLevel);
        setTimeout(() => {
          setJustLeveledUp(false);
          setNewLevel(null);
        }, 4000);
      } else {
        setLevel(nextLevel);
      }

      return newXP;
    });
  }, []);

  const refreshXP = useCallback(() => fetchProfile(), [fetchProfile]);

  const value = {
    xp,
    level,
    progress,
    xpForNext,
    addXP,
    refreshXP,
    loading,
    title: getLevelTitle(level),
    justLeveledUp,
    newLevel,
  };

  if (loading) {
    return (
      <LevelContext.Provider value={{ ...value, loading: true }}>
        {children}
      </LevelContext.Provider>
    );
  }

  return (
    <LevelContext.Provider value={value}>
      {children}
    </LevelContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error('useLevel must be used within a LevelProvider');
  }
  return context;
};
