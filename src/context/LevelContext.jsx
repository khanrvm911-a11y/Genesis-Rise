import { createContext, useContext, useEffect, useState } from 'react';
import { calculateLevelFromXP, getLevelProgress, getXPForNextLevel } from '../utils/workoutUtils';

const LevelContext = createContext();

// Default XP/level storage keys
const STORAGE_KEY_XP = 'sl_user_xp';
const STORAGE_KEY_LEVEL = 'sl_user_level';

export const LevelProvider = ({ children }) => {
  // Initialize state from localStorage
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_XP);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Derive level from xp
  const currentLevel = calculateLevelFromXP(xp);
  const progress = getLevelProgress(xp, currentLevel);
  const xpForNext = getXPForNextLevel(currentLevel);

  // Persist to localStorage whenever xp or currentLevel changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_XP, xp);
    localStorage.setItem(STORAGE_KEY_LEVEL, currentLevel);
  }, [xp, currentLevel]);

  // Function to add XP
  const addXP = (amount) => {
    setXp(prev => prev + amount);
  };

  const value = {
    xp,
    level: currentLevel,
    progress,
    xpForNext,
    addXP,
  };

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
