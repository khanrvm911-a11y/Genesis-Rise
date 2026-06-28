import { Link } from 'react-router-dom';
import igrisIllustration from '../assets/igris.png';

const About = () => {
  return (
    <div className="min-h-screen bg-sl-gradient">
      {/* Header */}

      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-wider uppercase gradient-text mb-6">
            About Genesis Rise Tracker
          </h1>
          <p className="text-sl-gray-light max-w-3xl mx-auto text-lg">
            A premium AI-powered fitness platform designed to help you build consistent habits, track measurable progress, and achieve your health and fitness goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Story */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-sl-purple-light">Our Mission</h2>
            <p className="text-sl-gray-light">
              Genesis Rise is a premium AI-powered fitness platform designed to help you build consistent habits, track measurable progress, and achieve your health and fitness goals. Whether you're a beginner starting your journey or an experienced athlete looking to optimize your training, Genesis Rise provides the tools, insights, and coaching you need.
            </p>
            <p className="text-sl-gray-light">
              Our mission is simple: make evidence-based fitness guidance accessible to everyone. By combining workout tracking, intelligent planning, health monitoring, and AI-powered coaching, we've created a comprehensive ecosystem that adapts to your goals and helps you stay on track.
            </p>
          </div>

          {/* Right: Illustration */}
          <div className="bg-sl-dark/40 backdrop-blur-sm rounded-sl-xl p-8 border border-sl-purple/20 shadow-sl-glow">
            <div className="w-24 h-24 bg-sl-purple/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <img src={igrisIllustration} alt="Illustration" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-bold text-sl-purple-light text-center">Train Smarter, Not Harder</h3>
            <p className="text-sl-gray-light text-center">
              Track workouts, plan training schedules, monitor health metrics, and get AI-powered coaching — all within a premium, immersive fitness platform.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-sl-purple-light">Features Overview</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Workout Tracker</h3>
                <p className="text-sl-gray-light">
                  Log your daily workouts with duration, calories, and date. Earn XP based on intensity and watch your level progress.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Training Planner</h3>
                <p className="text-sl-gray-light">
                  Schedule weekly training sessions using popular split templates or create custom plans with personalized exercise sequences.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Genesis Coach</h3>
                <p className="text-sl-gray-light">
                  Get AI-powered fitness and health advice from your personal coach, covering training, nutrition, recovery, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Health Tracking</h3>
                <p className="text-sl-gray-light">
                  Track weight, height, age, sleep, and other health metrics to monitor your overall well-being.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sl-dark/40 backdrop-blur-sm rounded-sl-xl p-8 text-center border border-sl-purple/20 shadow-sl-glow">
          <h2 className="text-2xl font-bold text-sl-purple-light mb-4">
            Join the Journey
          </h2>
          <p className="text-sl-gray-light mb-6">
            Whether you're a beginner starting your fitness journey or an experienced athlete looking for extra motivation, Genesis Rise provides the tools and coaching to help you reach your goals.
          </p>
          <Link to="/register" className="holo-button px-6 py-3">
            Start Your Adventure
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sl-gray-light/50">
        <p>© 2026 Genesis Rise System. All rights reserved.</p>
        <p>
          <Link to="/" className="text-sl-purple-light hover:text-sl-purple/70 transition">
            Return to Home
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default About;