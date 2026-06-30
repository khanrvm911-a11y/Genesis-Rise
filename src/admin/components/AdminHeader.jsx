import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LogOut, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AdminHeader({ title }) {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0a1a]/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold text-white">{title || 'Dashboard'}</h1>

      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">
              {adminUser?.email?.split('@')[0] || 'Admin'}
            </span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#12122a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm text-white truncate">{adminUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
