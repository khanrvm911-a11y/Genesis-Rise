import { useState } from 'react';

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
    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem('healthMetrics') || '[]');
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...metrics,
    };
    localStorage.setItem('healthMetrics', JSON.stringify([...stored, newEntry]));
    setLastSaved(new Date());
    // Reset form
    setMetrics({ weight: '', height: '', age: '', sleepHours: '' });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-wide uppercase gradient-text mb-2 animate-pulse-slow">
          Vessel Health Monitor
        </h1>
        <p className="text-sl-gray-light max-w-2xl mx-auto text-sm md:text-base">
          Maintain your physical vessel in peak condition. Record weight, height, age, and sleep parameters.
        </p>
      </div>

      {/* Log Today's Metrics */}
      <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow mb-8">
        <h2 className="text-xl font-bold text-sl-purple-light mb-6 border-b border-sl-purple/15 pb-2 uppercase tracking-wider">Log Today's Parameters</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={metrics.weight}
              onChange={handleChange}
              className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500"
              placeholder="e.g., 70"
              min="0"
              step="0.1"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light mb-2">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={metrics.height}
              onChange={handleChange}
              className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500"
              placeholder="e.g., 175"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={metrics.age}
              onChange={handleChange}
              className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500"
              placeholder="e.g., 25"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light mb-2">Sleep (hours)</label>
            <input
              type="number"
              name="sleepHours"
              value={metrics.sleepHours}
              onChange={handleChange}
              className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500"
              placeholder="e.g., 8"
              min="0"
              max="24"
              step="0.5"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="holo-button w-full py-3.5 text-center font-bold tracking-wider uppercase hover:shadow-sl-glow-purple transition duration-300"
            >
              Record Metrics
            </button>
          </div>
        </form>
        {lastSaved && (
          <p className="mt-4 text-center text-emerald-400 font-bold animate-pulse text-sm">
            ✓ Metrics successfully committed to history: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Display saved metrics */}
      <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
        <h2 className="text-xl font-bold text-sl-purple-light mb-6 border-b border-sl-purple/15 pb-2 uppercase tracking-wider">
          Vessel Parameters History Log
        </h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {(() => {
            const stored = localStorage.getItem('healthMetrics');
            if (!stored) {
              return <p className="text-center py-6 text-sl-purple-light/50">No health metrics logged yet.</p>;
            }
            const healthList = JSON.parse(stored);
            if (healthList.length === 0) {
              return <p className="text-center py-6 text-sl-purple-light/50">No health metrics logged yet.</p>;
            }
            return healthList.slice().reverse().map((entry) => (
              <div key={entry.id} className="p-4 bg-sl-gray/25 rounded-sl-lg border border-sl-purple/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-sl-gray/35 transition duration-300">
                <div>
                  <span className="text-xxs uppercase tracking-wider text-sl-purple-light/50 font-bold block mb-1">Entry Timestamp</span>
                  <p className="text-sm font-semibold text-white">{new Date(entry.date).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold md:text-sm">
                  <span className="bg-sl-purple/10 border border-sl-purple/20 px-3 py-1 rounded-full text-sl-purple-light">
                    Weight: {entry.weight} kg
                  </span>
                  <span className="bg-sl-purple/10 border border-sl-purple/20 px-3 py-1 rounded-full text-sl-purple-light">
                    Height: {entry.height} cm
                  </span>
                  <span className="bg-sl-purple/10 border border-sl-purple/20 px-3 py-1 rounded-full text-sl-purple-light">
                    Age: {entry.age}
                  </span>
                  <span className="bg-sl-purple/10 border border-sl-purple/20 px-3 py-1 rounded-full text-sl-purple-light">
                    Sleep: {entry.sleepHours} hrs
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default Health;