import { useState, useEffect, useRef, useCallback } from 'react';
import { useLevel } from '../context/LevelContext';

const XPToast = () => {
  const { level } = useLevel();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);
  const prevLevelRef = useRef(level);

  const show = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { amount, level: newLevel, xp } = e.detail || {};
      const leveledUp = newLevel > prevLevelRef.current;
      prevLevelRef.current = newLevel || level;
      if (amount) {
        show(leveledUp ? `+${amount} XP \u2022 Level ${newLevel}!` : `+${amount} XP`);
      }
    };
    window.addEventListener('XP_CHANGED', handler);
    return () => window.removeEventListener('XP_CHANGED', handler);
  }, [level, show]);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level;
    }
  }, [level]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-sl-purple to-amber-500 text-white px-3 py-2 rounded-xl shadow-2xl shadow-sl-purple/40 border border-white/10 animate-in">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full shrink-0">
          <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="font-bold text-white text-xs whitespace-nowrap">{message}</p>
      </div>
    </div>
  );
};

export default XPToast;
