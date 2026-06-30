import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login, signInWithGoogle, resendVerificationForEmail } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('gr_remember_identifier');
    if (saved) {
      setIdentifier(saved);
      setRememberMe(true);
    }
  }, []);

  const detectCapsLock = (e) => {
    setCapsLock(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    setError('');
    setResentMsg('');
    setUnconfirmedEmail('');
    try {
      await login(identifier.trim(), password);
      if (rememberMe) {
        localStorage.setItem('gr_remember_identifier', identifier.trim());
      } else {
        localStorage.removeItem('gr_remember_identifier');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Email not confirmed')) {
        const extractedEmail = identifier.includes('@') ? identifier.trim() : '';
        setUnconfirmedEmail(extractedEmail);
        setError('Please verify your email before logging in.');
      } else if (msg.includes('Invalid login credentials') || msg.includes('User not found')) {
        setError('Incorrect username/email or password.');
      } else if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
        setError('Too many attempts. Please wait before trying again.');
      } else if (msg.includes('Network') || msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!identifier.includes('@') && !unconfirmedEmail) return;
    setResending(true);
    setResentMsg('');
    try {
      await resendVerificationForEmail(identifier.includes('@') ? identifier.trim() : unconfirmedEmail);
      setResentMsg('Verification email sent! Check your inbox.');
    } catch {
      setResentMsg('Failed to resend. Try again later.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setSocialLoading(null);
    }
  };

  
  const isSubmitting = loading || socialLoading;

  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/75" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Genesis Rise
          </h1>
          <p className="text-sl-gray-light/70 text-lg mt-1 font-medium">Welcome back</p>
        </div>

        <div className="space-y-4">
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={!!isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-black/10"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="w-5 h-5 shrink-0 relative z-10" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-white font-medium text-base relative z-10">Continue with Google</span>
            {socialLoading === 'google' && (
              <svg className="w-4 h-4 animate-spin text-white/60 relative z-10" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </motion.button>

                  </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-identifier" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Username or Email
            </label>
            <input
              id="login-identifier"
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
              className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white"
              placeholder="Enter username or email"
              autoComplete="username"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={detectCapsLock}
                onKeyUp={detectCapsLock}
                className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
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
            <AnimatePresence>
              {capsLock && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-amber-400 text-xs mt-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Caps Lock is on
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                rememberMe
                  ? 'bg-sl-purple-light border-sl-purple-light'
                  : 'bg-transparent border-white/20 group-hover:border-sl-purple-light/50'
              }`}>
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-white/50 group-hover:text-white/70 transition">Remember me</span>
            </label>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="text-center"
              >
                <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                  {error}
                </p>
                {unconfirmedEmail && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="inline-block mt-2 text-xs text-amber-400 hover:text-amber-300 transition font-medium underline underline-offset-2 disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
                {resentMsg && (
                  <p className="mt-1 text-xs text-emerald-400">{resentMsg}</p>
                )}
                <Link
                  to="/forgot-password"
                  className="inline-block mt-2 text-xs text-sl-purple-light/70 hover:text-sl-purple-light transition font-medium underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSubmitting || !identifier.trim() || !password}
            className="holo-button-primary w-full py-3.5 rounded-xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-sl-purple-light hover:text-sl-purple-light/80 transition font-semibold">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
