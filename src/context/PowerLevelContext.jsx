import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const PowerLevelContext = createContext();

export const PowerLevelProvider = ({ children }) => {
  const { user } = useAuth();
  const [powerLevel, setPowerLevel] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch power level from Supabase
  useEffect(() => {
    if (!user) {
      setPowerLevel(0);
      setWeeklyChange(0);
      setLoading(false);
      return;
    }

    const fetchPowerLevel = async () => {
      try {
        const { data, error } = await supabase
          .from('power_levels')
          .select('level, weekly_change')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching power level:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setPowerLevel(data.level);
          setWeeklyChange(data.weekly_change);
        } else {
          // No record, create default
          const { data: insertData, error: insertError } = await supabase
            .from('power_levels')
            .insert({
              user_id: user.id,
              level: 0,
              weekly_change: 0,
            })
            .select();

          if (insertError) {
            console.error('Error creating power level record:', insertError);
          } else {
            setPowerLevel(0);
            setWeeklyChange(0);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPowerLevel();
  }, [user]);

  // Persist power level to Supabase whenever it changes
  useEffect(() => {
    if (!user) return;

    const updatePowerLevel = async () => {
      try {
        const { error } = await supabase
          .from('power_levels')
          .upsert({
            user_id: user.id,
            level: powerLevel,
            weekly_change: weeklyChange,
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error updating power level:', error);
        }
      } catch (err) {
        console.error('Error updating power level:', err);
      }
    };

    updatePowerLevel();
  }, [powerLevel, weeklyChange, user]);

  // Also persist to localStorage for backward compatibility and offline support
  useEffect(() => {
    if (!user) return;
    localStorage.setItem('sl_power_level', powerLevel);
    localStorage.setItem('sl_weekly_change', weeklyChange);
  }, [powerLevel, weeklyChange, user]);

  // Function to add power level (called after workout)
  const addPowerLevel = (amount) => {
    setPowerLevel(prev => prev + amount);
  };

  // Function to set weekly change (called periodically, e.g., weekly)
  const setWeeklyChangeValue = (change) => {
    setWeeklyChange(change);
  };

  const value = {
    powerLevel,
    weeklyChange,
    loading,
    addPowerLevel,
    setWeeklyChange: setWeeklyChangeValue,
  };

  if (loading) {
    return (
      <PowerLevelContext.Provider value={{ ...value, loading: true }}>
        {children}
      </PowerLevelContext.Provider>
    );
  }

  return (
    <PowerLevelContext.Provider value={value}>
      {children}
    </PowerLevelContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePowerLevel = () => {
  const context = useContext(PowerLevelContext);
  if (!context) {
    throw new Error('usePowerLevel must be used within a PowerLevelProvider');
  }
  return context;
};