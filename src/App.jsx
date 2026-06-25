import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Activity, Calendar, Sparkles, Heart } from 'lucide-react';
import Tracker from './components/Tracker';
import Planner from './components/Planner';
import Adviser from './components/Adviser';
import Health from './components/Health';
import Home from './pages/Home';
import About from './pages/About';
import { useLevel } from './context/LevelContext';
import { useAuth } from './context/AuthContext';
import XPToast from './components/XPToast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';

function App() {
  const { level, xp, progress, title, xpForNext } = useLevel();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const publicPaths = ['/', '/about', '/login', '/register', '/forgot-password', '/reset-password'];

  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" replace={true} />;
  }

  const getUserName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.email) return user.email.split('@')[0];
    return 'Champion';
  };

  return (
    <div className="min-h-screen bg-sl-gradient text-sl-gray-light">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-sl-pattern opacity-10"></div>
      </div>

      <nav className="bg-sl-dark/95 backdrop-blur-sm px-8 border-b border-sl-purple/20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between min-h-[120px]">
             <Link to="/" className="flex items-center gap-5 no-underline flex-1">
              <div className="w-14 h-14 flex items-center justify-center bg-sl-purple/20 rounded-full border border-sl-purple shadow-sl-glow-purple overflow-hidden shrink-0">
                <img src="/igris_shadow_face.png" alt="Genesis Rise" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-start leading-none shrink-0">
                <span className="text-[70px] font-bold text-[#B56CFF] select-none"
                      style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 30px rgba(181,108,255,0.4)' }}>
                  G
                </span>
                <div className="ml-0.5 mt-3">
                  <div className="text-[32px] font-bold text-white/90 leading-none tracking-wider whitespace-nowrap"
                       style={{ fontFamily: "'Cinzel', serif" }}>
                    ENESIS
                  </div>
                  <div className="text-[24px] font-semibold text-white/70 leading-none tracking-[0.2em] mt-1 whitespace-nowrap"
                       style={{ fontFamily: "'Cinzel', serif" }}>
                    RISE
                  </div>
                </div>
              </div>
            </Link>

            {user && (
              <div className="flex items-center gap-10">
                <div className="bg-sl-dark/80 border border-sl-purple/30 rounded-xl px-6 py-4 text-center select-none shadow-lg shadow-sl-purple/10">
                  <div className="text-[15px] text-sl-purple-light font-bold tracking-[0.15em] uppercase">Level {level}</div>
                  <div className="text-[18px] text-white font-semibold mt-1.5">{title}</div>
                </div>

                <div className="bg-sl-dark/80 border border-sl-purple/30 rounded-xl px-6 py-4 min-w-[200px] shadow-lg shadow-sl-purple/10">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[15px] font-bold text-sl-purple-light">{xp} XP</span>
                    <span className="text-[15px] text-sl-gray-light">/ {xpForNext} XP</span>
                  </div>
                  <div className="w-full h-3 bg-sl-gray/40 rounded-full overflow-hidden border border-sl-purple/20 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000 rounded-full"
                         style={{ width: `${Math.min(100, progress * 100)}%`, boxShadow: '0 0 8px rgba(139,92,246,0.4)' }}></div>
                  </div>
                  <div className="text-[13px] text-sl-gray-light mt-1.5 text-right font-medium">{Math.floor(progress * 100)}%</div>
                </div>

                <div className="relative">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }} className="flex items-center gap-3 px-5 py-3 bg-sl-dark/80 border border-sl-purple/30 rounded-xl hover:bg-sl-purple/10 transition shadow-lg shadow-sl-purple/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sl-purple to-sl-red flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                      {getUserName().charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[16px] text-sl-purple-light font-semibold truncate">{getUserName()}</span>
                    <svg className="w-4 h-4 text-sl-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#221133] border border-[#B56CFF] rounded-xl z-20"
                         style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 15px rgba(181,108,255,0.25)' }}
                         onClick={(e) => e.stopPropagation()}>
                      <div className="px-4 py-3.5 border-b border-[#B56CFF]/20">
                        <p className="font-semibold text-sl-purple-light text-[15px]">{getUserName()}</p>
                      </div>
                      <button onClick={() => { logout(); setDropdownOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-3 text-[15px] text-[#FF5D73] hover:bg-[#35204F] transition flex items-center gap-2">
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <div className="flex items-center gap-4">
                <Link to="/login" className="holo-button px-6 py-2.5 text-sm min-w-[100px]">Login</Link>
                <Link to="/register" className="holo-button holo-button-primary px-6 py-2.5 text-sm min-w-[120px]">Register</Link>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center justify-center py-3 border-t border-sl-purple/10">
              <div className="flex items-center gap-3">
                {[
                  { to: '/', icon: HomeIcon, label: 'Home' },
                  { to: '/tracker', icon: Activity, label: 'Tracker' },
                  { to: '/planner', icon: Calendar, label: 'Planner' },
                  { to: '/adviser', icon: Sparkles, label: 'Adviser' },
                  { to: '/health', icon: Heart, label: 'Health' },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 text-[17px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                      location.pathname === to
                        ? 'text-sl-purple-light'
                        : 'text-sl-gray-light hover:text-white hover:bg-sl-gray/20 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

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
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </Routes>

      <div className="fixed bottom-4 right-4 z-50">
        <XPToast />
      </div>
    </div>
  );
}

export default App;
