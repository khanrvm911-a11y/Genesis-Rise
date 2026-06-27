import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

const REST_OPTIONS = [30, 60, 90, 120];

export default function RestTimer({ onComplete, onSkip, autoStart = true, defaultDuration = 60 }) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(autoStart);
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
              setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1100;
                osc2.type = 'sine';
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.3);
              }, 200);
            } catch { /* audio context not available */ }
            if (onComplete) onComplete();
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
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    if (onSkip) onSkip();
    if (onComplete) onComplete();
  };

  const changeDuration = (secs) => {
    setDuration(secs);
    setTimeLeft(secs);
    setIsRunning(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? 1 - (timeLeft / duration) : 0;

  const size = 140;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="mobile-card border-sl-red/30 animate-slide-up p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">Rest Timer</h3>
        <div className="flex gap-1.5">
          {REST_OPTIONS.map(opt => (
            <button key={opt} onClick={() => changeDuration(opt)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all touch-target ${
                duration === opt
                  ? 'bg-sl-red text-white shadow-sl-glow-red'
                  : 'bg-sl-gray/30 text-sl-gray-light hover:bg-sl-gray/50'
              }`}>
              {opt}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="url(#restGradient)"
              strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            <defs>
              <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-white tabular-nums">
              {minutes}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="text-[10px] text-sl-gray-light font-semibold uppercase mt-0.5">
              {timeLeft === 0 ? 'Done' : 'Rest'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-2">
        {timeLeft > 0 && (
          isRunning ? (
            <button onClick={pause} className="holo-button text-sm py-2 px-4 flex items-center gap-1.5">
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : (
            <button onClick={resume} className="holo-button text-sm py-2 px-4 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          )
        )}
        {timeLeft > 0 && (
          <button onClick={skip} className="holo-button text-sm py-2 px-4 flex items-center gap-1.5">
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </button>
        )}
        {timeLeft === 0 && (
          <button onClick={() => changeDuration(duration)} className="holo-button holo-button-primary text-sm py-2 px-4 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Rest Again
          </button>
        )}
      </div>
    </div>
  );
}
