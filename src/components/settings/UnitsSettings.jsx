import { Ruler, Weight, MapPin, Droplets } from 'lucide-react';

const UNIT_GROUPS = [
  {
    id: 'weight',
    label: 'Weight Unit',
    icon: Weight,
    options: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'lbs', label: 'Pounds' },
    ],
  },
  {
    id: 'height',
    label: 'Height Unit',
    icon: Ruler,
    options: [
      { value: 'cm', label: 'Centimeters' },
      { value: 'ft', label: 'Feet & Inches' },
    ],
  },
  {
    id: 'distance',
    label: 'Distance Unit',
    icon: MapPin,
    options: [
      { value: 'km', label: 'Kilometers' },
      { value: 'mi', label: 'Miles' },
    ],
  },
  {
    id: 'water',
    label: 'Water Intake Unit',
    icon: Droplets,
    options: [
      { value: 'ml', label: 'Milliliters' },
      { value: 'l', label: 'Liters' },
    ],
  },
];

export default function UnitsSettings({ settings, onUpdate, showToast }) {
  const currentUnits = settings.units;

  const handleChange = (key, value) => {
    onUpdate(`units.${key}`, value);
    showToast(`${UNIT_GROUPS.find(g => g.id === key)?.label} changed to ${value === 'kg' ? 'kg' : value === 'lbs' ? 'lbs' : value === 'cm' ? 'cm' : value === 'ft' ? 'ft' : value === 'km' ? 'km' : value === 'mi' ? 'mi' : value === 'ml' ? 'ml' : 'l'}`);
  };

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-sl-purple-light" />
          Units & Preferences
        </h3>
      </div>

      {UNIT_GROUPS.map(group => {
        const Icon = group.icon;
        const currentValue = currentUnits[group.id];

        return (
          <div key={group.id} className="px-4 py-4 border-b border-sl-purple/10 last:border-b-0">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-sl-purple-light" />
              <p className="text-xs font-semibold text-white">{group.label}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.options.map(opt => {
                const active = currentValue === opt.value;
                return (
                  <button key={opt.value} onClick={() => handleChange(group.id, opt.value)}
                    className={`rounded-xl px-3 py-2.5 border transition text-left ${
                      active
                        ? 'bg-sl-purple/20 border-sl-purple/40 shadow-sl-glow'
                        : 'bg-sl-gray/30 border-sl-purple/10 hover:bg-sl-gray/40'
                    }`}>
                    <p className={`text-xs font-bold ${active ? 'text-sl-purple-light' : 'text-white'}`}>{opt.value.toUpperCase()}</p>
                    <p className={`text-[10px] mt-0.5 ${active ? 'text-sl-purple-light/70' : 'text-sl-purple-light/50'}`}>{opt.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
