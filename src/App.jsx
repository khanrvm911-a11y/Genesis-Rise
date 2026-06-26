import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Activity, Calendar, Sparkles, Heart, BarChart3, LogOut, ChevronDown, Dumbbell, Flame, Zap, Shield, Crown, Star } from 'lucide-react';
import Tracker from './components/Tracker';
import Planner from './components/Planner';
import Adviser from './components/Adviser';
import Health from './components/Health';
import Analysis from './components/Analysis';
import Home from './pages/Home';
import About from './pages/About';
import { useLevel } from './context/LevelContext';
import { useAuth } from './context/AuthContext';
import { useAvatar } from './context/AvatarContext';
import XPToast from './components/XPToast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const NAV_ITEMS = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/tracker', icon: Activity, label: 'Tracker' },
  { to: '/planner', icon: Calendar, label: 'Planner' },
  { to: '/adviser', icon: Sparkles, label: 'Coach' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
];

function App() {
  const { level, xp, progress, title, xpForNext } = useLevel();
  const { user, logout, loading } = useAuth();
  const { avatar, avatarType } = useAvatar();

  const AVATAR_PRESETS = [
    { id: 'dumbbell', icon: Dumbbell, colors: 'from-sl-purple to-sl-red' },
    { id: 'activity', icon: Activity, colors: 'from-blue-500 to-cyan-400' },
    { id: 'heart', icon: Heart, colors: 'from-red-500 to-pink-400' },
    { id: 'flame', icon: Flame, colors: 'from-orange-500 to-red-400' },
    { id: 'zap', icon: Zap, colors: 'from-yellow-500 to-amber-400' },
    { id: 'shield', icon: Shield, colors: 'from-emerald-500 to-teal-400' },
    { id: 'crown', icon: Crown, colors: 'from-purple-500 to-pink-400' },
    { id: 'star', icon: Star, colors: 'from-amber-500 to-orange-400' },
  ];
  const avatarPreset = AVATAR_PRESETS.find(p => p.id === avatar);
  const AvatarIcon = avatarPreset?.icon;
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const publicPaths = ['/', '/about', '/login', '/register', '/forgot-password', '/reset-password', '/terms', '/privacy'];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (!user && !isPublicPage) {
    if (loading) return null;
    return <Navigate to="/login" replace={true} />;
  }

  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  const getUserName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.email) return user.email.split('@')[0];
    return 'Athlete';
  };

  return (
    <div className="min-h-screen bg-sl-gradient text-sl-gray-light">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-sl-pattern opacity-10"></div>
      </div>

      {user && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-sl-dark/95 backdrop-blur-md border-b border-sl-purple/20 safe-area-top">
          <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
            <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
              <div className="w-10 h-10 flex items-center justify-center bg-sl-purple/20 rounded-full border border-sl-purple shadow-sl-glow-purple overflow-hidden shrink-0">
                <img src="/igris_shadow_face.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-start leading-none">
                <span className="text-4xl font-bold text-[#B56CFF] select-none"
                      style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 20px rgba(181,108,255,0.4)' }}>
                  G
                </span>
                <div className="ml-0.5 mt-1">
                  <div className="text-lg font-bold text-white/90 leading-none tracking-wider whitespace-nowrap"
                       style={{ fontFamily: "'Cinzel', serif" }}>
                    ENESIS
                  </div>
                  <div className="text-xs font-semibold text-white/70 leading-none tracking-[0.2em] mt-0.5 whitespace-nowrap"
                       style={{ fontFamily: "'Cinzel', serif" }}>
                    RISE
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="bg-sl-dark/60 border border-sl-purple/20 rounded-lg px-3 py-1.5 text-center select-none shadow-lg shadow-sl-purple/5">
                <div className="text-[10px] text-sl-purple-light font-bold tracking-[0.15em] uppercase leading-tight">Lv.{level}</div>
                <div className="text-[11px] text-white font-semibold leading-tight">{title}</div>
              </div>

              <div className="hidden sm:flex bg-sl-dark/60 border border-sl-purple/20 rounded-lg px-3 py-1.5 min-w-[120px] shadow-lg shadow-sl-purple/5">
                <div className="w-full">
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[10px] font-bold text-sl-purple-light">{xp} XP</span>
                    <span className="text-[10px] text-sl-gray-light">/ {xpForNext}</span>
                  </div>
                  <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden border border-sl-purple/10 mt-0.5">
                    <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000 rounded-full"
                         style={{ width: `${Math.min(100, progress * 100)}%`, boxShadow: '0 0 6px rgba(139,92,246,0.4)' }}></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sl-dark/60 border border-sl-purple/20 rounded-lg hover:bg-sl-purple/10 transition shadow-lg shadow-sl-purple/5">
                  {avatarType === 'custom' && avatar ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden shadow-lg shrink-0">
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shrink-0 ${avatarType === 'preset' && avatarPreset ? `bg-gradient-to-br ${avatarPreset.colors}` : 'bg-gradient-to-br from-sl-purple to-sl-red'}`}>
                      {avatarType === 'preset' && AvatarIcon ? (
                        <AvatarIcon className="w-4 h-4" />
                      ) : (
                        getUserName().charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                  <span className="text-[13px] text-sl-purple-light font-semibold truncate max-w-[60px] hidden xs:inline">{getUserName()}</span>
                  <ChevronDown className="w-3 h-3 text-sl-purple-light shrink-0" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#221133] border border-sl-purple/30 rounded-xl z-20 shadow-xl"
                       style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                       onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-sl-purple/20">
                      <p className="font-semibold text-sl-purple-light text-sm">{getUserName()}</p>
                      {user?.email && <p className="text-xs text-sl-gray-light/50 mt-0.5">{user.email}</p>}
                    </div>
                    <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-3 text-sm text-sl-purple-light hover:bg-sl-purple/10 transition flex items-center gap-2">
                      Profile
                    </button>
                    <button onClick={() => { logout(); setDropdownOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950/20 transition flex items-center gap-2 rounded-b-xl">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sl-dark/98 backdrop-blur-md border-t border-sl-purple/20 safe-area-bottom">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-all relative ${
                    isActive ? 'text-sl-purple-light' : 'text-sl-gray-light/60 hover:text-sl-gray-light'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sl-purple rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <main className={user ? 'pt-16 pb-20' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/adviser" element={<Adviser />} />
          <Route path="/health" element={<Health />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </main>

      <div className="fixed bottom-20 right-4 z-50">
        <XPToast />
      </div>
    </div>
  );
}

export default App;
