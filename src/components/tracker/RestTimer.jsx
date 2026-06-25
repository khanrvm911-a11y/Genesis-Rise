import { useState, useEffect, useRef } from 'react';

const REST_OPTIONS = [30, 60, 90, 120];

export default function RestTimer({ onComplete, autoStart = true, defaultDuration = 60 }) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [show, setShow] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.type = 'sine';
              gain.gain.value = 0.3;
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);
  const skip = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setShow(false);
    if (onComplete) onComplete();
  };

  const changeDuration = (secs) => {
    setSelectedDuration(secs);
    setDuration(secs);
    setTimeLeft(secs);
    setIsRunning(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - (timeLeft / duration);

  if (!show) return null;

  return (
    <div className="mobile-card border-sl-red/30 animate-slide-up p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">Rest Timer</h3>
        <div className="flex gap-1.5">
          {REST_OPTIONS.map(opt => (
            <button key={opt} onClick={() => changeDuration(opt)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all touch-target ${
                selectedDuration === opt ? 'bg-sl-red text-white shadow-sl-glow-red' : 'bg-sl-gray/30 text-sl-gray-light hover:bg-sl-gray/50'
              }`}>
              {opt}s
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-3">
        <p className="text-4xl font-bold text-white tabular-nums">
          {minutes}:{String(seconds).padStart(2, '0')}
        </p>
        <div className="w-full bg-sl-gray/40 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {isRunning ? (
          <button onClick={pause} className="holo-button text-sm py-2 px-4">⏸ Pause</button>
        ) : timeLeft > 0 ? (
          <button onClick={resume} className="holo-button text-sm py-2 px-4">▶ Resume</button>
        ) : null}
        <button onClick={skip} className="holo-button holo-button-danger text-sm py-2 px-4">⏭ Skip</button>
      </div>
    </div>
  );
}
