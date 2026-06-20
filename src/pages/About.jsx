import { Link } from 'react-router-dom';
import '../App.css';

const About = () => {
  return (
    <div className="min-h-screen bg-sl-gradient">
      {/* Header */}

      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-wider uppercase gradient-text mb-6">
            About Solo Leveling Workout Tracker
          </h1>
          <p className="text-sl-gray-light max-w-3xl mx-auto text-lg">
            A fitness application that transforms your workout routine into an epic leveling journey inspired by the popular Solo Leveling anime and web novel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Story */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-sl-purple-light">Our Inspiration</h2>
            <p className="text-sl-gray-light">
              Drawing inspiration from Sung Jin-Woo's journey from the weakest hunter to the strongest shadow monarch, this app encourages users to view their fitness journey as a series of quests and challenges. Each workout is a step toward becoming stronger, both physically and mentally.
            </p>
            <p className="text-sl-gray-light">
              Just as the System assigns daily quests to hunters in the Solo Leveling universe, our Quest Planner helps you schedule your training trials. Complete them to earn XP, level up, and unlock new ranks—mirroring the progression system that makes the story so compelling.
            </p>
          </div>

          {/* Right: Illustration */}
          <div className="bg-sl-dark/40 backdrop-blur-sm rounded-sl-xl p-8 border border-sl-purple/20 shadow-sl-glow">
            <div className="w-24 h-24 bg-sl-purple/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <img src="/igris.png" alt="Illustration" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-bold text-sl-purple-light text-center">Train Like a Hunter</h3>
            <p className="text-sl-gray-light text-center">
              Track workouts, plan quests, monitor health, and get advice—all within a immersive Solo Leveling-themed interface.
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
                <h3 className="text-xl font-bold text-sl-purple-light">Quest Planner</h3>
                <p className="text-sl-gray-light">
                  Schedule weekly training using predefined System Quests (E-S rank) or create custom plans with personalized exercise sequences and rewards.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">System Adviser</h3>
                <p className="text-sl-gray-light">
                  Get AI-powered fitness and health advice from the System Advisor terminal, powered by Gemini API.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Health Monitor</h3>
                <p className="text-sl-gray-light">
                  Track weight, height, age, and sleep metrics to maintain your vessel in peak condition.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-sl-purple/20 rounded-full text-sl-purple-light font-bold">
                5
              </div>
              <div>
                <h3 className="text-xl font-bold text-sl-purple-light">Plan Designer</h3>
                <p className="text-sl-gray-light">
                  Create custom workout plans with specific exercises, sets, reps, and ranks to maximize XP scaling and tailor your training to your goals.
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
            Whether you're a beginner starting your fitness journey or an experienced athlete looking for extra motivation, Solo Leveling Workout Tracker provides the tools and motivation to level up your life.
          </p>
          <Link to="/register" className="holo-button px-6 py-3">
            Start Your Adventure
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sl-gray-light/50">
        <p>© 2026 Solo Leveling System. All rights reserved.</p>
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