import { useState, useEffect } from 'react';
import { useLevel } from '../context/LevelContext';

const XPToast = () => {
  const { level } = useLevel();
  const [prevLevel, setPrevLevel] = useState(level);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (level > prevLevel) {
    setPrevLevel(level);
    setToastVisible(true);
    setToastMessage(`Level Up! You are now Level ${level}`);
  }

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  if (!toastVisible) return null;

  return (
    <div className="bg-sl-purple/90 backdrop-blur-sm text-sl-purple-light p-4 rounded-sl-lg shadow-sl-glow max-w-xs animate-in border border-sl-purple/30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/50 rounded-full">
          <svg className="w-5 h-5 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M5 10h14" />
          </svg>
        </div>
        <div>
          <p className="font-bold">{toastMessage}</p>
          <p className="text-xxs text-sl-purple-light/50">Vessel capability upgraded. Keep training!</p>
        </div>
      </div>
    </div>
  );
};

export default XPToast;