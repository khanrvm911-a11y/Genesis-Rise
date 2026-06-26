import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  getLevelTitle,
} from '../utils/workoutUtils';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [xpForNext, setXpForNext] = useState(0);
  const [loading, setLoading] = useState(true);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  useEffect(() => {
    if (!user) {
      setXp(0);
      setLevel(1);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('level, xp')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setXp(data.xp);
          setLevel(data.level);
        } else {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || '',
            level: 1,
            xp: 0,
            rank: 'Initiate',
          });
          setXp(0);
          setLevel(1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const p = getLevelProgress(xp, level);
    setProgress(p);
    setXpForNext(getXPForNextLevel(level));
  }, [xp, level]);

  useEffect(() => {
    if (!user) return;

    const updateProfile = async () => {
      try {
        await supabase.from('profiles').update({ xp, level, rank: getLevelTitle(level) }).eq('id', user.id);
      } catch (err) {
        console.error('Error updating profile:', err);
      }
    };

    updateProfile();
  }, [xp, level, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem('sl_user_xp', xp);
    localStorage.setItem('sl_user_level', level);
  }, [xp, level, user]);

  const addXP = useCallback((amount) => {
    setXp(prev => {
      const newXP = prev + amount;
      const newLevel = calculateLevelFromXP(newXP);
      const currentLevel = calculateLevelFromXP(prev);

      if (newLevel > currentLevel) {
        setNewLevel(newLevel);
        setJustLeveledUp(true);
        setLevel(newLevel);
        setTimeout(() => {
          setJustLeveledUp(false);
          setNewLevel(null);
        }, 4000);
      } else {
        setLevel(newLevel);
      }

      return newXP;
    });
  }, []);

  const value = {
    xp,
    level,
    progress,
    xpForNext,
    addXP,
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
