import { useNavigate } from 'react-router-dom';
import { Sparkles, Bell } from 'lucide-react';

// TODO: Restore AI Coach chat interface when feature is ready
// Remove this placeholder and restore the full Adviser implementation with useState,
// DOMPurify, Send/RotateCcw imports, chat messages, and API integration below

const Adviser = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sl-gradient flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="mobile-container">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-sl-purple/10 border border-sl-purple/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-sl-purple-light" />
            </div>

            <h1 className="text-2xl font-bold gradient-text mb-3">AI Coach</h1>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sl-purple/15 text-sl-purple-light border border-sl-purple/25 mb-6">
              Coming Soon
            </span>

            <h2 className="text-xl font-bold text-white mb-4">Still in Development</h2>

            <p className="text-sm text-sl-gray-light leading-relaxed max-w-md mb-4">
              Genesis AI Coach is currently under development. We're working hard to bring you a smarter, personalized coaching experience. Thank you for your patience.
            </p>

            <p className="text-sm text-sl-gray-light leading-relaxed max-w-md mb-4">
              We're building an intelligent AI Coach to deliver personalized workout plans, nutrition guidance, recovery recommendations, and fitness insights.
            </p>

            <p className="text-sm text-sl-gray-light leading-relaxed max-w-md mb-8">
              Our goal is to provide a reliable coaching experience that truly helps you reach your fitness goals.
            </p>

            <div className="w-full max-w-md p-4 rounded-xl bg-sl-gray/20 border border-sl-purple/15 mb-8">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-sl-purple-light shrink-0 mt-0.5" />
                <p className="text-sm text-sl-gray-light leading-relaxed">
                  We'll notify you as soon as the AI Coach is available.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => navigate('/')}
                className="holo-button holo-button-primary flex-1"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/tracker')}
                className="holo-button flex-1"
              >
                Explore Other Features
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adviser;
