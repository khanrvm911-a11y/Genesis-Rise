import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cfToken, setCfToken] = useState(''); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          callback: (token) => setCfToken(token),
          'expired-callback': () => setCfToken(''),
        });
        return;
      }
    };

    if (window.turnstile) {
      initTurnstile();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.head.appendChild(script);
    }

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center gradient-text animate-pulse-red">
            Genesis Rise
          </h2>
          <p className="text-center text-sl-gray-light">
            Recover your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div ref={turnstileRef} className="flex justify-center"></div>

          {error && (
            <p className="text-red-500 text-center text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="text-emerald-400 text-center text-sm">
              A recovery link has been sent to your email.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`holo-button w-full py-3 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Recovery Link'}
          </button>
        </form>

        <div className="text-center text-sl-gray-light/50">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="text-sl-purple-light hover:text-sl-purple/70 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
