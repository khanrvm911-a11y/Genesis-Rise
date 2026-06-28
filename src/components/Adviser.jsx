import { Sparkles, Home, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const Adviser = () => {
  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-sl-purple/10 border border-sl-purple/30 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-sl-purple-light" />
        </div>
        <h1 className="text-3xl font-bold text-sl-purple-light mb-3">Genesis Coach</h1>
        <p className="text-sl-gray-light text-lg mb-2">
          Still in development
        </p>
        <p className="text-sl-gray-light/60 text-sm mb-8">
          We'll notify you when it's ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sl-purple/20 hover:bg-sl-purple/30 border border-sl-purple/40 rounded-xl text-sl-purple-light font-semibold text-sm transition-all">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link to="/tracker"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sl-dark/40 hover:bg-sl-dark/60 border border-sl-gray/40 rounded-xl text-sl-gray-light font-semibold text-sm transition-all">
            <Compass className="w-4 h-4" />
            Explore Features
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Adviser;
