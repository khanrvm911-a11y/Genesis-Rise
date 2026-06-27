import { useState, useEffect, useRef } from 'react';
import { useLevel } from '../context/LevelContext';

const XPToast = () => {
  const { level } = useLevel();
  const prevLevelRef = useRef(level);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setToastVisible(true);
      setToastMessage(`Level Up! You are now Level ${level}`);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  if (!toastVisible) return null;

  return (
    <div className="bg-gradient-to-r from-sl-purple to-amber-500 text-white p-4 rounded-xl shadow-2xl shadow-sl-purple/40 max-w-xs animate-in border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full shrink-0">
          <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-sm">{toastMessage}</p>
          <p className="text-[11px] text-white/70">Keep training. Greatness awaits!</p>
        </div>
      </div>
    </div>
  );
};

export default XPToast;