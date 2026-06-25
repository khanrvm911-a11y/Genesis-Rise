import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoginTransition from './LoginTransition';
import VideoBackground from './VideoBackground';

const Login = () => {
  const { login } = useAuth();
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [cfToken, setCfToken] = useState(''); // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (window.turnstile && turnstileRef.current) {
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
        callback: (token) => setCfToken(token),
        'expired-callback': () => setCfToken(''),
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          callback: (token) => setCfToken(token),
          'expired-callback': () => setCfToken(''),
        });
      }
    };
    document.head.appendChild(script);

      return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formState.email, formState.password);
      setShowTransition(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
        setError('Too many login attempts. Please wait before trying again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <VideoBackground src="/videos/genesis-bg.mp4" />
      <div className="absolute inset-0 bg-black/75" />
      <div className={`w-full max-w-md space-y-8 relative z-10 transition-all duration-500 ${showTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div>
          <h2 className="text-5xl font-bold text-center gradient-text animate-pulse-red">
            Genesis Rise
          </h2>
          <p className="text-center text-sl-gray-light text-xl font-semibold">
            Welcome Champion
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formState.password}
                onChange={handleChange}
                className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                minLength="12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sl-gray-light/60 hover:text-sl-purple-light transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.169 5.169M6.343 6.343L3 3m3.343 3.343l2.829 2.829m4.486 4.486L17.657 17.657M17.657 17.657L21 21m-3.343-3.343l-2.829-2.829a4 4 0 01-5.656-5.656" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div ref={turnstileRef} className="flex justify-center"></div>

          {error && (
            <p className="text-red-500 text-center text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`holo-button w-full py-3 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Logging In...' : 'Enter The System'}
          </button>
        </form>

        <div className="text-center text-sl-gray-light/50">
          <p>
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-sl-purple-light hover:text-sl-purple/70 transition">
              Reset it here
            </Link>
          </p>
        </div>

        <div className="text-center text-sl-gray-light/50">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-sl-purple-light hover:text-sl-purple/70 transition">
              Register here
            </Link>
          </p>
        </div>
      </div>
      {showTransition && <LoginTransition onComplete={() => setShowTransition(false)} />}
    </div>
  );
};

export default Login;
