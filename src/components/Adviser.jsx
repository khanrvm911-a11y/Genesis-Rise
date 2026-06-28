import { Sparkles } from 'lucide-react';

const Adviser = () => {
  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-sl-purple/10 border border-sl-purple/30 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-sl-purple-light" />
        </div>
        <h1 className="text-3xl font-bold text-sl-purple-light mb-3">Genesis Coach</h1>
        <p className="text-sl-gray-light text-lg mb-4">
          Still in development
        </p>
        <p className="text-sl-gray-light/60 text-sm">
          We'll notify you when it's ready.
        </p>
      </div>
    </div>
  );
};

export default Adviser;
