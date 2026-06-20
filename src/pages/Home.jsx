import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLevel } from '../context/LevelContext';
import '../App.css';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const { user } = useAuth();
  const { level, xp, progress } = useLevel();
  const navigate = useNavigate();
  const location = useLocation();
  const [workouts, setWorkouts] = useState([]);

  // Load workouts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('workouts');
    setWorkouts(stored ? JSON.parse(stored) : []);
  }, []);

  // If user is logged in, redirect to tracker (or show dashboard)
  // We'll show a dashboard view instead of redirecting for immediate value
  // but we can also redirect. Let's show dashboard.

  const handleGetStarted = () => {
    navigate('/tracker');
  };

  if (user) {
    // Dashboard view for logged-in user
    const recentWorkouts = workouts.slice().reverse().slice(0, 3);
    return (
      <div className="min-h-screen bg-sl-gradient">
        {/* Header */}

        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-wide uppercase gradient-text mb-2">
              Welcome Back, {user.name || 'Hunter'}
            </h1>
            <p className="text-sl-gray-light max-w-2xl mx-auto text-sm md:text-base">
              Your Solo Leveling journey continues. Track your progress, plan your workouts, and level up.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Level</h3>
              <p className="text-3xl font-bold text-sl-purple-light">{level}</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">XP</h3>
              <p className="text-3xl font-bold text-sl-purple-light">{xp}</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Workouts</h3>
              <p className="text-3xl font-bold text-sl-purple-light">{workouts.length}</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Progress to Next Level</h3>
              <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden border border-sl-purple/10 mt-2">
                <div className={`h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000`} style={{ width: `${progress * 100}%` }}></div>
              </div>
              <p className="text-xs text-sl-purple-light mt-1">{Math.floor(progress * 100)}%</p>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-sl-red-light mb-4">
              Recent Activity
            </h2>
            {workouts.length === 0 ? (
              <p className="text-sl-gray-light text-center py-8">No workouts logged yet. Start your first training session!</p>
            ) : (
              <div className="space-y-4">
                {recentWorkouts.map((w) => (
                  <div key={w.id} className="p-4 bg-sl-gray/20 backdrop-blur-sm rounded-sl-xl border border-sl-red/20 shadow-sl-glow flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{w.name}</h3>
                      <p className="text-sl-gray-light text-sm">{new Date(w.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sl-gray-light">
                      <span>{w.duration} min</span>
                      <span>{w.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/tracker" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              Log Workout
            </Link>
            <Link to="/planner" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              Plan Quest
            </Link>
            <Link to="/adviser" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              Ask Adviser
            </Link>
            <Link to="/health" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              Health Metrics
            </Link>
            <Link to="/plan-designer" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              Design Plan
            </Link>
            <Link to="/about" className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow holo-button w-full">
              About
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guest view (landing page)
  return (
    <>
      <Helmet>
        <title>Solo Leveling Workout Tracker - Level Up Your Fitness Journey</title>
        <meta name="description" content="Transform your workout routine into an epic leveling journey inspired by Solo Leveling. Track workouts, earn XP, complete quests, and become the strongest version of yourself." />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:title" content="Solo Leveling Workout Tracker - Level Up Your Fitness Journey" />
        <meta property="og:description" content="Transform your workout routine into an epic leveling journey inspired by Solo Leveling. Track workouts, earn XP, complete quests, and become the strongest version of yourself." />
        <meta property="og:image" content="https://yourdomain.com/igris_shadow_face.png" />
        <meta property="og:image:alt" content="Solo Leveling Igris Logo" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://yourdomain.com/" />
        <meta property="twitter:title" content="Solo Leveling Workout Tracker - Level Up Your Fitness Journey" />
        <meta property="twitter:description" content="Transform your workout routine into an epic leveling journey inspired by Solo Leveling. Track workouts, earn XP, complete quests, and become the strongest version of yourself." />
        <meta property="twitter:image" content="https://yourdomain.com/igris_shadow_face.png" />
        {/* Structured Data / JSON-LD */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Solo Leveling Workout Tracker",
          "description": "A fitness application that transforms your workout routine into an epic leveling journey inspired by Solo Leveling.",
          "url": "https://yourdomain.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yourdomain.com/?s={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }, null, 2)}</script>
      </Helmet>
      <div className="min-h-screen bg-sl-gradient">
      {/* Optional animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-sl-pattern opacity-10"></div>
      </div>

      {/* Header */}

      <div className="max-w-7xl mx-auto py-20 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-wider uppercase gradient-text mb-6">
            Level Up Your Fitness Journey
          </h1>
          <p className="text-sl-gray-light max-w-3xl mx-auto text-lg">
            Inspired by the Solo Leveling anime, transform your workouts into a quest for strength. Track progress, earn XP, unlock achievements, and become the strongest version of yourself.
          </p>
          <div className="flex justify-center mt-8 space-x-4">
            <Link to="/register" className="holo-button px-6 py-3">
              Start Your Journey
            </Link>
            <Link to="/login" className="holo-button px-6 py-3 text-sl-purple-light border border-sl-purple/30 hover:border-sl-purple/50">
              Already have an account?
            </Link>
          </div>
        </div>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center gradient-text mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-conten mb-4">
                <svg className="w-8 h-8 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-3">Workout Tracker</h3>
              <p className="text-sl-gray-light text-center">Log your daily workouts, track duration, calories, and earn XP based on intensity.</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-3">Quest Planner</h3>
              <p className="text-sl-gray-light text-center">Schedule weekly training using System Quests (E-S rank) or create custom plans with personalized rewards.</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-3">System Adviser</h3>
              <p className="text-sl-gray-light text-center">Get AI-powered fitness and health advice from the System Advisor terminal.</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-sl-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-3">Health Monitor</h3>
              <p className="text-sl-gray-light text-center">Track weight, height, age, and sleep to maintain your vessel in peak condition.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center gradient-text mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow text-center">
              <div className="w-14 h-14 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sl-purple-light font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Log Your Training</h3>
              <p className="text-sl-gray-light">Record each workout with duration and calories burned to earn XP.</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow text-center">
              <div className="w-14 h-14 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sl-purple-light font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Complete Quests</h3>
              <p className="text-sl-gray-light">Follow daily quests or custom plans to earn bonus XP and level up faster.</p>
            </div>
            <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow text-center">
              <div className="w-14 h-14 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sl-purple-light font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-sl-purple-light mb-4">Level Up</h3>
              <p className="text-sl-gray-light">Watch your level increase as you accumulate XP, unlocking new ranks and rewards.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-sl-dark/40 backdrop-blur-sm rounded-sl-xl p-12 text-center border border-sl-purple/20 shadow-sl-glow">
          <h2 className="text-3xl font-bold text-sl-purple-light mb-6">
            Ready to begin your transformation?
          </h2>
          <p className="text-sl-gray-light mb-8">
            Create your hunter profile and start earning XP today. No credit card required.
          </p>
          <Link to="/register" className="holo-button px-8 py-3">
            Awaken Your Power
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sl-gray-light/50">
        <p>© 2026 Solo Leveling System. All rights reserved.</p>
      </footer>
    </div>
    </>
  );
};

export default Home;