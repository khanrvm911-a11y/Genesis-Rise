import { useState, useRef, useCallback } from 'react';
import { Heart, Activity, Zap, Flame, Trophy, Clock } from 'lucide-react';

const ZONES = [
  { label: 'Warm-up', range: '50–60%', color: 'from-blue-400 to-blue-500', text: 'text-blue-400', icon: Heart, desc: 'Recovery & warm-up' },
  { label: 'Fat Burn', range: '60–70%', color: 'from-green-400 to-emerald-500', text: 'text-green-400', icon: Activity, desc: 'Endurance & fat loss' },
  { label: 'Cardio', range: '70–80%', color: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', icon: Zap, desc: 'Aerobic conditioning' },
  { label: 'High Intensity', range: '80–90%', color: 'from-orange-400 to-red-500', text: 'text-orange-400', icon: Flame, desc: 'Anaerobic threshold' },
  { label: 'Peak', range: '90–100%', color: 'from-red-500 to-rose-600', text: 'text-red-400', icon: Trophy, desc: 'Max effort' },
];

export default function BPMCalculator() {
  const [age, setAge] = useState(25);
  const [restingHR, setRestingHR] = useState(70);
  const [gender, setGender] = useState('male');
  const [tapping, setTapping] = useState(false);
  const [tapBpm, setTapBpm] = useState(null);
  const tapsRef = useRef([]);
  const tapTimerRef = useRef(null);

  const maxHR = gender === 'female' ? 206 - 0.88 * age : 220 - age;
  const hrReserve = maxHR - restingHR;

  const handleTap = useCallback(() => {
    const now = Date.now();
    tapsRef.current = tapsRef.current.filter(t => now - t < 3000);
    tapsRef.current.push(now);

    if (tapsRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapsRef.current.length; i++) {
        intervals.push(tapsRef.current[i] - tapsRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setTapBpm(Math.round(60000 / avgInterval));
    }

    setTapping(true);
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      setTapping(false);
      tapsRef.current = [];
    }, 3000);
  }, []);

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-sl-purple-light" />
          <h3 className="text-sm font-bold text-white">BPM Calculator</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Age</label>
            <input type="number" value={age} onChange={e => setAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 0)))}
              className="w-full h-9 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50" min="1" max="120" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Resting HR (BPM)</label>
            <input type="number" value={restingHR} onChange={e => setRestingHR(Math.max(30, Math.min(220, parseInt(e.target.value) || 0)))}
              className="w-full h-9 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50" min="30" max="220" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1.5">Gender</label>
          <div className="flex gap-2">
            {['male', 'female'].map(g => (
              <button key={g} onClick={() => setGender(g)}
                className={`flex-1 h-9 rounded-lg text-xs font-bold border transition ${
                  gender === g ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light' : 'bg-sl-gray/40 border-sl-purple/15 text-sl-gray-light hover:bg-sl-gray/30'
                }`}>
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-sl-gray/30 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-sl-purple-light/60 font-semibold">Max HR</span>
            <span className="text-sm font-bold text-white">{Math.round(maxHR)} BPM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-sl-purple-light/60 font-semibold">Heart Rate Reserve</span>
            <span className="text-sm font-bold text-white">{Math.round(hrReserve)} BPM</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60">Heart Rate Zones</p>
          {ZONES.map((zone, i) => {
            const min = Math.round(maxHR * (0.5 + i * 0.1) * 100) / 100;
            const max = Math.round(maxHR * (0.5 + (i + 1) * 0.1) * 100) / 100;
            const Icon = zone.icon;
            return (
              <div key={zone.label} className="bg-sl-gray/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${zone.text}`} />
                    <span className={`text-xs font-bold ${zone.text}`}>{zone.label}</span>
                  </div>
                  <span className="text-[10px] text-sl-purple-light/60 font-semibold">{Math.round(min)}–{Math.round(max)} BPM</span>
                </div>
                <p className="text-[9px] text-sl-gray-light/50 mb-1.5">{zone.desc}</p>
                <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${zone.color}`} style={{ width: `${(i + 1) * 20}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-sl-gray/30 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Tap BPM
          </p>
          <p className="text-[9px] text-sl-gray-light/50 mb-3">Tap the button in time with your pulse for 10–15 seconds</p>
          <button onClick={handleTap}
            className={`w-full h-12 rounded-xl text-sm font-bold border transition ${
              tapping ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-sl-purple/15 border-sl-purple/25 text-sl-purple-light hover:bg-sl-purple/25'
            }`}>
            {tapBpm ? `${tapBpm} BPM` : tapping ? 'Tap...' : 'Tap Here'}
          </button>
          {tapBpm && (
            <div className="mt-2 text-center">
              <span className="text-[11px] text-sl-gray-light/60">
                {tapBpm < 40 ? 'Resting (low)' : tapBpm < 60 ? 'Athlete range' : tapBpm < 80 ? 'Normal range' : tapBpm < 100 ? 'Active range' : 'Elevated'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
