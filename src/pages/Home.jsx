import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLevel } from '../context/LevelContext';
import { Activity, Calendar, Sparkles, Heart, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const { user } = useAuth();
  const { level, xp, progress } = useLevel();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('sl_workout_history') || localStorage.getItem('workouts');
    setWorkouts(stored ? JSON.parse(stored) : []);
  }, []);

  if (user) {
    const recentWorkouts = Array.isArray(workouts) ? [...workouts].reverse().slice(0, 5) : [];
    return (
      <div className="min-h-screen bg-sl-gradient">
        <div className="mobile-container py-6">
          <div className="mb-6 text-center animate-slide-up">
            <h1 className="text-2xl font-extrabold tracking-wide uppercase gradient-text mb-1">
              Welcome Back
            </h1>
            <p className="text-base text-sl-gray-light">
               {user.user_metadata?.username || user.email?.split('@')[0] || 'Athlete'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="mobile-card text-center p-4">
              <div className="text-2xl font-bold text-sl-purple-light">{level}</div>
              <div className="text-[10px] text-sl-gray-light uppercase tracking-wider mt-0.5 font-semibold">Level</div>
            </div>
            <div className="mobile-card text-center p-4">
              <div className="text-2xl font-bold text-sl-purple-light">{xp}</div>
              <div className="text-[10px] text-sl-gray-light uppercase tracking-wider mt-0.5 font-semibold">XP</div>
            </div>
            <div className="mobile-card text-center p-4">
              <div className="text-2xl font-bold text-sl-purple-light">{workouts.length}</div>
              <div className="text-[10px] text-sl-gray-light uppercase tracking-wider mt-0.5 font-semibold">Workouts</div>
            </div>
          </div>

          <div className="mobile-card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sl-purple-light uppercase tracking-wider">Progress to Next Level</span>
              <span className="text-xs text-sl-purple-light font-semibold">{Math.floor(progress * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-sl-gray/40 rounded-full overflow-hidden border border-sl-purple/10">
              <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000 rounded-full" style={{ width: `${progress * 100}%` }}></div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-sl-red-light mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            {recentWorkouts.length === 0 ? (
              <div className="mobile-card text-center py-8">
                <p className="text-sl-gray-light">No workouts logged yet.</p>
                <p className="text-sm text-sl-purple-light mt-1">Start your first training session!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w, i) => (
                  <div key={w.id} className="mobile-card flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm truncate">{w.name || w.workout_name || 'Workout'}</h3>
                      <p className="text-xs text-sl-gray-light mt-0.5">{new Date(w.date || w.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-sl-gray-light shrink-0 ml-3">
                      <span className="font-semibold">{w.duration || w.total_duration || 0} min</span>
                      <span className="font-semibold text-sl-red-light">{w.calories || w.total_calories || 0} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/tracker')} className="mobile-card flex flex-col items-center justify-center p-5 border-sl-purple/30 hover:border-sl-purple/60 active:scale-[0.97] cursor-pointer">
              <Activity className="w-7 h-7 text-sl-purple-light mb-2" />
              <span className="text-sm font-bold text-white">Tracker</span>
            </button>
            <button onClick={() => navigate('/planner')} className="mobile-card flex flex-col items-center justify-center p-5 border-sl-purple/30 hover:border-sl-purple/60 active:scale-[0.97] cursor-pointer">
              <Calendar className="w-7 h-7 text-sl-purple-light mb-2" />
              <span className="text-sm font-bold text-white">Planner</span>
            </button>
            <button onClick={() => navigate('/adviser')} className="mobile-card flex flex-col items-center justify-center p-5 border-sl-purple/30 hover:border-sl-purple/60 active:scale-[0.97] cursor-pointer">
              <Sparkles className="w-7 h-7 text-sl-purple-light mb-2" />
              <span className="text-sm font-bold text-white">Coach</span>
            </button>
            <button onClick={() => navigate('/health')} className="mobile-card flex flex-col items-center justify-center p-5 border-sl-purple/30 hover:border-sl-purple/60 active:scale-[0.97] cursor-pointer">
              <Heart className="w-7 h-7 text-sl-purple-light mb-2" />
              <span className="text-sm font-bold text-white">Health</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Genesis Rise Tracker - Level Up Your Fitness Journey</title>
        <meta name="description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:title" content="Genesis Rise - AI-Powered Fitness Platform" />
        <meta property="og:description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
        <meta property="og:image" content="https://yourdomain.com/igris_shadow_face.png" />
        <meta property="og:image:alt" content="Genesis Rise Logo" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://yourdomain.com/" />
        <meta property="twitter:title" content="Genesis Rise - AI-Powered Fitness Platform" />
        <meta property="twitter:description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
        <meta property="twitter:image" content="https://yourdomain.com/igris_shadow_face.png" />
      </Helmet>
      <div className="min-h-screen bg-sl-gradient">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-sl-pattern opacity-10"></div>
        </div>

        <div className="mobile-container py-8">
          <div className="text-center mb-10 pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center bg-sl-purple/20 rounded-full border-2 border-sl-purple shadow-sl-glow-purple overflow-hidden">
                <img src="/igris_shadow_face.png" alt="Genesis Rise" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider uppercase gradient-text mb-3">
              Achieve Your Fitness Goals
            </h1>
            <p className="text-sl-gray-light text-base max-w-lg mx-auto">
              Track workouts, earn XP, and build consistent habits with personalized coaching, training plans, and health insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Link to="/register" className="holo-button holo-button-primary px-8 py-3 text-center w-full sm:w-auto">
                Start Your Journey
              </Link>
              <Link to="/login" className="holo-button px-8 py-3 text-center w-full sm:w-auto">
                Sign In
              </Link>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-center gradient-text mb-6">Features</h2>
            <div className="space-y-4">
              <div className="mobile-card flex items-start gap-4 p-5">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-sl-purple-light" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-1">Workout Tracker</h3>
                  <p className="text-sm text-sl-gray-light">Log your daily workouts, track duration, calories, and earn XP based on intensity.</p>
                </div>
              </div>
              <div className="mobile-card flex items-start gap-4 p-5">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-sl-purple-light" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-1">Mission Planner</h3>
                   <p className="text-sm text-sl-gray-light">Schedule weekly training plans or create custom routines with personalized exercise sequences.</p>
                </div>
              </div>
              <div className="mobile-card flex items-start gap-4 p-5">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-sl-purple-light" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-sl-purple-light mb-1">Genesis Coach</h3>
                   <p className="text-sm text-sl-gray-light">Get AI-powered fitness and health advice from your personal AI fitness coach.</p>
                </div>
              </div>
              <div className="mobile-card flex items-start gap-4 p-5">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-sl-purple-light" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-1">Health Monitor</h3>
                  <p className="text-sm text-sl-gray-light">Track weight, height, age, and sleep to maintain your vessel in peak condition.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-center gradient-text mb-6">How It Works</h2>
            <div className="space-y-4">
              <div className="mobile-card p-5 text-center">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sl-purple-light font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-bold text-sl-purple-light mb-2">Log Your Training</h3>
                <p className="text-sm text-sl-gray-light">Record each workout with duration and calories burned to earn XP.</p>
              </div>
              <div className="mobile-card p-5 text-center">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sl-purple-light font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-bold text-sl-purple-light mb-2">Complete Missions</h3>
                <p className="text-sm text-sl-gray-light">Follow Daily Missions or custom plans to earn bonus XP and level up faster.</p>
              </div>
              <div className="mobile-card p-5 text-center">
                <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sl-purple-light font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-bold text-sl-purple-light mb-2">Level Up</h3>
                <p className="text-sm text-sl-gray-light">Watch your level increase as you accumulate XP, unlocking new titles and rewards.</p>
              </div>
            </div>
          </section>

          <div className="mobile-card p-6 text-center border-sl-purple/30 mb-8">
            <h2 className="text-xl font-bold text-sl-purple-light mb-3">Ready to begin your transformation?</h2>
            <p className="text-sm text-sl-gray-light mb-5">Create your profile and start earning XP today. No credit card required.</p>
            <Link to="/register" className="holo-button holo-button-primary w-full text-center">
              Start Your Transformation
            </Link>
          </div>

          <footer className="text-center text-sl-gray-light/50 text-xs pb-8">
            <p>&copy; 2026 Genesis Rise System. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Home;
