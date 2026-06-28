import { useState } from 'react';
import {
  Info, ExternalLink, FileText, Shield, BookOpen,
  MessageCircle, Bug, Lightbulb, Heart, ChevronRight,
} from 'lucide-react';

export default function AboutSection({ settings, onUpdate, showToast }) {
  const [showLicenses, setShowLicenses] = useState(false);

  const handleLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const links = [
    { icon: FileText, label: 'Privacy Policy', url: '/privacy' },
    { icon: Shield, label: 'Terms of Service', url: '/terms' },
    { icon: BookOpen, label: 'Release Notes', action: () => showToast('Genesis Rise v1.0.0 — Initial release with workout tracking, AI coaching, and analytics.') },
    { icon: MessageCircle, label: 'Contact Support', url: 'mailto:support@genesisrise.app' },
    { icon: Bug, label: 'Report a Bug', url: 'https://github.com/genesisrise/app/issues' },
    { icon: Lightbulb, label: 'Request a Feature', url: 'https://github.com/genesisrise/app/issues' },
    { icon: BookOpen, label: 'Open Source Licenses', action: () => setShowLicenses(!showLicenses) },
  ];

  const licenses = [
    { name: 'React', license: 'MIT' },
    { name: 'Vite', license: 'MIT' },
    { name: 'Supabase', license: 'MIT' },
    { name: 'Tailwind CSS', license: 'MIT' },
    { name: 'Lucide Icons', license: 'ISC' },
    { name: 'Chart.js', license: 'MIT' },
    { name: 'Groq SDK', license: 'Apache 2.0' },
    { name: 'Framer Motion', license: 'MIT' },
    { name: 'React Router', license: 'MIT' },
  ];

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-sl-purple-light" />
          About Genesis Rise
        </h3>
      </div>

      <div className="px-4 py-4 border-b border-sl-purple/10 text-center">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 bg-sl-purple/10">
          <img src="/igris_shadow_face.png" alt="Genesis Rise Logo" className="w-full h-full object-contain" />
        </div>
        <h4 className="text-base font-bold text-white">Genesis Rise</h4>
        <p className="text-xs text-sl-purple-light/60 mt-1">Version 1.0.0</p>
        <p className="text-[10px] text-sl-gray-light/40 mt-0.5">Build 2026.06.27.001</p>
      </div>

      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <div key={i} className="px-4 py-3.5 border-b border-sl-purple/10 last:border-b-0">
            <button onClick={() => {
              if (link.url) handleLink(link.url);
              if (link.action) link.action();
            }}
              className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-sl-purple-light" />
                <span className="text-xs font-semibold text-white">{link.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-sl-purple-light/30" />
            </button>
          </div>
        );
      })}

      {showLicenses && (
        <div className="px-4 py-3 border-t border-sl-purple/10 bg-sl-gray/15">
          <p className="text-[10px] font-bold text-sl-purple-light/60 uppercase tracking-wider mb-2">Open Source Licenses</p>
          <div className="space-y-1.5">
            {licenses.map((lib, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-white/80">{lib.name}</span>
                <span className="text-sl-purple-light/50">{lib.license}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-4 text-center">
        <p className="text-[10px] text-sl-purple-light/40 flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-400" /> by Genesis Rise Team
        </p>
        <p className="text-[9px] text-sl-gray-light/30 mt-1">&copy; {new Date().getFullYear()} Genesis Rise. All rights reserved.</p>
      </div>
    </div>
  );
}
