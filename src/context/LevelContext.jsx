import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
} from '../utils/workoutUtils';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [xpForNext, setXpForNext] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  useEffect(() => {
    if (!user) {
      // No user, reset to defaults (could also load from localStorage as fallback)
      const savedXP = localStorage.getItem('sl_user_xp');
      const savedLevel = localStorage.getItem('sl_user_level');
      if (savedXP !== null && savedLevel !== null) {
        setXp(parseInt(savedXP, 10));
        setLevel(parseInt(savedLevel, 10));
      } else {
        setXp(0);
        setLevel(1);
      }
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
          // Profile not found, create default profile
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              username: user.user_metadata?.username || '',
              level: 1,
              xp: 0,
              rank: 'Novice',
            })
            .select();

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            setXp(0);
            setLevel(1);
          }
        }

        // Calculate progress and XP for next level
        const progress = getLevelProgress(xp, level);
        setProgress(progress);
        setXpForNext(getXPForNextLevel(level));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Persist XP and level to Supabase whenever they change
  useEffect(() => {
    if (!user) return;

    const updateProfile = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ xp, level })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile:', error);
        }
      } catch (err) {
        console.error('Error updating profile:', err);
      }
    };

    updateProfile();
  }, [xp, level, user]);

  // Also persist to localStorage for backward compatibility and offline support
  useEffect(() => {
    if (!user) return;
    localStorage.setItem('sl_user_xp', xp);
    localStorage.setItem('sl_user_level', level);
  }, [xp, level, user]);

  // Function to add XP
  const addXP = (amount) => {
    setXp(prev => prev + amount);
  };

  // Function to get rank based on level (we can compute from level using thresholds)
  // We'll create a simple ranking system based on level
  const getRankFromLevel = (level) => {
    const ranks = ['Novice', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Champion', 'Legend'];
    const index = Math.min(Math.floor((level - 1) / 10), ranks.length - 1);
    return ranks[index];
  };

  const value = {
    xp,
    level,
    progress,
    xpForNext,
    addXP,
    loading,
    rank: getRankFromLevel(level),
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