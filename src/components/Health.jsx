import { useState } from 'react';
import { Heart, Weight, Ruler, Clock, Activity } from 'lucide-react';

const Health = () => {
  const [metrics, setMetrics] = useState({
    weight: '',
    height: '',
    age: '',
    sleepHours: '',
  });
  const [lastSaved, setLastSaved] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetrics(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('healthMetrics') || '[]');
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...metrics,
    };
    localStorage.setItem('healthMetrics', JSON.stringify([...stored, newEntry]));
    setLastSaved(new Date());
    setMetrics({ weight: '', height: '', age: '', sleepHours: '' });
  };

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold gradient-text">Vessel Health Monitor</h1>
          <p className="text-xs text-sl-gray-light mt-0.5">Maintain your vessel in peak condition</p>
        </div>

        <div className="mobile-card mb-4 p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Log Today's Parameters
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light mb-1.5">
                  <Weight className="w-3 h-3 inline mr-1" />Weight (kg)
                </label>
                <input type="number" name="weight" value={metrics.weight} onChange={handleChange}
                  className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500 py-3" placeholder="70" min="0" step="0.1" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />Height (cm)
                </label>
                <input type="number" name="height" value={metrics.height} onChange={handleChange}
                  className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500 py-3" placeholder="175" min="0" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light mb-1.5">
                  <Heart className="w-3 h-3 inline mr-1" />Age
                </label>
                <input type="number" name="age" value={metrics.age} onChange={handleChange}
                  className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500 py-3" placeholder="25" min="0" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light mb-1.5">
                  <Clock className="w-3 h-3 inline mr-1" />Sleep (hrs)
                </label>
                <input type="number" name="sleepHours" value={metrics.sleepHours} onChange={handleChange}
                  className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500 py-3" placeholder="8" min="0" max="24" step="0.5" required />
              </div>
            </div>
            <button type="submit" className="holo-button holo-button-primary w-full py-3.5 text-sm font-bold tracking-wider uppercase">
              Record Metrics
            </button>
          </form>
          {lastSaved && (
            <p className="mt-3 text-center text-emerald-400 font-bold text-xs animate-pulse">
              ✓ Saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="mobile-card p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-3 flex items-center gap-2 border-b border-sl-purple/15 pb-2">
            <Activity className="w-4 h-4" />
            History
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(() => {
              const stored = localStorage.getItem('healthMetrics');
              if (!stored) return <p className="text-center py-6 text-sl-purple-light/50 text-sm">No health metrics logged yet.</p>;
              const healthList = JSON.parse(stored);
              if (healthList.length === 0) return <p className="text-center py-6 text-sl-purple-light/50 text-sm">No health metrics logged yet.</p>;
              return healthList.slice().reverse().map((entry) => (
                <div key={entry.id} className="p-3 bg-sl-gray/25 rounded-xl border border-sl-purple/15 hover:bg-sl-gray/35 transition duration-300">
                  <div className="mb-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-sl-purple-light/50 font-bold">Entry</span>
                    <p className="text-xs font-semibold text-white">{new Date(entry.date).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-sl-purple/10 border border-sl-purple/20 px-2 py-0.5 rounded-full text-[10px] text-sl-purple-light font-semibold">
                      W: {entry.weight} kg
                    </span>
                    <span className="bg-sl-purple/10 border border-sl-purple/20 px-2 py-0.5 rounded-full text-[10px] text-sl-purple-light font-semibold">
                      H: {entry.height} cm
                    </span>
                    <span className="bg-sl-purple/10 border border-sl-purple/20 px-2 py-0.5 rounded-full text-[10px] text-sl-purple-light font-semibold">
                      Age: {entry.age}
                    </span>
                    <span className="bg-sl-purple/10 border border-sl-purple/20 px-2 py-0.5 rounded-full text-[10px] text-sl-purple-light font-semibold">
                      Sleep: {entry.sleepHours}h
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
