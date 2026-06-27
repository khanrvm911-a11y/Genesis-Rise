import { Type, Palette } from 'lucide-react';

const FONT_SIZES = [
  { id: 'small', label: 'Small', preview: 'S' },
  { id: 'medium', label: 'Medium', preview: 'M' },
  { id: 'large', label: 'Large', preview: 'L' },
];

export default function AppearanceSettings({ settings, onUpdate, showToast }) {
  const currentFont = settings.appearance.fontSize;

  const handleFontChange = (size) => {
    onUpdate('appearance.fontSize', size);
    showToast(`Font size: ${size}`);
  };

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-sl-purple-light" />
          Appearance
        </h3>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-sl-purple-light" />
          Font Size
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZES.map(f => {
            const active = currentFont === f.id;
            return (
              <button key={f.id} onClick={() => handleFontChange(f.id)}
                className={`rounded-xl p-3 border transition text-center ${
                  active
                    ? 'bg-sl-purple/20 border-sl-purple/40 shadow-sl-glow'
                    : 'bg-sl-gray/30 border-sl-purple/10 hover:bg-sl-gray/40'
                }`}>
                <p className={`font-bold mb-0.5 ${active ? 'text-sl-purple-light' : 'text-sl-gray-light'} ${
                  f.id === 'small' ? 'text-sm' : f.id === 'large' ? 'text-lg' : 'text-base'
                }`}>Aa</p>
                <p className={`text-[11px] font-bold ${active ? 'text-sl-purple-light' : 'text-sl-gray-light'}`}>{f.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
