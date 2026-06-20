import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Tracker from './components/Tracker';
import Planner from './components/Planner';
import Adviser from './components/Adviser';
import Health from './components/Health';
import PlanDesigner from './components/PlanDesigner';
import WorkoutLogger from './components/WorkoutLogger';
import Home from './pages/Home';
import About from './pages/About';
import { useLevel } from './context/LevelContext';
import { useAuth } from './context/AuthContext';
import XPToast from './components/XPToast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile'; // Import Profile component
// import BackgroundParticles from './components/BackgroundParticles'; // Optional

function App() {
  const { level, xp, progress } = useLevel();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on window click
  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  // Define public routes that don't require authentication
  const publicPaths = ['/', '/about', '/login', '/register', '/forgot-password', '/reset-password'];

  // Redirect to login if not on a public path and not authenticated
  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" replace={true} />;
  }

  // Get username from user metadata or fallback to email
  const getUserName = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    // Fallback: use part of email before @
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Champion';
  };

  return (
    <div className="min-h-screen bg-sl-gradient text-sl-gray-light">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-sl-pattern opacity-10"></div>
        {/* Optional: <BackgroundParticles /> */}
      </div>

      <nav className="bg-sl-dark/90 backdrop-blur-sm p-4 border-b border-sl-purple/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 text-2xl font-extrabold tracking-wider gradient-text hover:opacity-85 transition">
            <div className="w-9 h-9 flex items-center justify-center bg-sl-purple/20 rounded-full border border-sl-purple shadow-sl-glow-purple overflow-hidden">
              <img src="/igris_shadow_face.png" alt="Igris Logo" className="w-full h-full object-cover transform scale-110" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif" }}>Genesis Rise</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Level indicator with XP bar (only show when logged in) */}
            {user && (
              <>
                <div className="flex items-center space-x-3 bg-sl-purple/20 px-3 py-1 rounded-full border border-sl-purple/30 shadow-sl-glow">
                  <span className="text-xs text-sl-purple-light">Lv.</span>
                  <span className="font-bold text-sl-purple-light" id="user-level">{level}</span>
                </div>

                {/* Slim XP bar */}
                <div className="flex-1 max-w-xs">
                  <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden border border-sl-purple/10">
                    <div className={`h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000`} style={{ width: `${progress * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-sl-purple-light mt-1 flex justify-between">
                    <span>{xp} XP</span>
                    <span>{Math.floor(progress * 100)}%</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-2">
              {/* User profile dropdown */}
              {user && (
                <div className="relative">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }} className="flex items-center space-x-2 p-1.5 hover:bg-sl-purple/15 rounded-full transition border border-transparent hover:border-sl-purple/20">
                    <span className="hidden md:block text-sl-purple-light font-semibold">{getUserName()}</span>
                    <svg className="w-4 h-4 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {/* Simple dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-sl-dark/95 backdrop-blur-md border border-sl-purple/30 rounded-sl-lg shadow-sl-glow z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3 p-4 border-b border-sl-purple/10">
                        <div>
                          <p className="font-semibold text-sl-purple-light">{getUserName()}</p>
                        </div>
                      </div>
                      <button onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-3 text-sl-purple-light hover:bg-sl-purple/15 transition flex items-center space-x-2">
                        <svg className="w-4 h-4 text-sl-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nav links for guests (login/register) */}
              {!user && (
                <>
                  <Link to="/login" className="holo-button holo-button-sm px-4">
                    Login
                  </Link>
                  <Link to="/register" className="holo-button holo-button-sm px-4 ml-2">
                    Register
                  </Link>
                </>
              )}

              {/* App links (only show when logged in) */}
              {user && (
                <div className="flex space-x-2">
                  <Link to="/" className="holo-button holo-button-sm px-4">
                    Home
                  </Link>
                  <Link to="/tracker" className="holo-button holo-button-sm px-4">
                    Tracker
                  </Link>
                  <Link to="/workout-logger" className="holo-button holo-button-sm px-4">
                    Workout Logger
                  </Link>
                  <Link to="/planner" className="holo-button holo-button-sm px-4">
                    Planner
                  </Link>
                  <Link to="/adviser" className="holo-button holo-button-sm px-4">
                    Adviser
                  </Link>
                  <Link to="/health" className="holo-button holo-button-sm px-4">
                    Health
                  </Link>
                  <Link to="/plan-designer" className="holo-button holo-button-sm px-4">
                    Plan Designer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/workout-logger" element={<WorkoutLogger />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/adviser" element={<Adviser />} />
        <Route path="/health" element={<Health />} />
        <Route path="/plan-designer" element={<PlanDesigner />} />
        <Route path="/profile" element={<Profile />} /> {/* Profile route */}

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </Routes>

      {/* Toast container for level-ups */}
      <div className="fixed bottom-4 right-4 z-50">
        <XPToast />
      </div>
    </div>
  );
}

export default App;