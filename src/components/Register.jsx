import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission } from '../lib/permissions';

const hasSpecialChar = (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p);

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character', test: hasSpecialChar },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const Register = () => {
  const { register, signInWithGoogle, checkUsernameExists, checkEmailExists } = useAuth();

  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const debouncedUsername = useDebounce(formState.username, 500);
  const debouncedEmail = useDebounce(formState.email, 500);

  useEffect(() => {
    if (debouncedUsername.length < 2) {
      setUsernameStatus(null);
      return;
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(debouncedUsername)) {
      setUsernameStatus('invalid');
      return;
    }
    let cancelled = false;
    checkUsernameExists(debouncedUsername).then((exists) => {
      if (!cancelled) setUsernameStatus(exists ? 'taken' : 'available');
    });
    return () => { cancelled = true; };
  }, [debouncedUsername, checkUsernameExists]);

  useEffect(() => {
    if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setEmailStatus(null);
      return;
    }
    let cancelled = false;
    checkEmailExists(debouncedEmail).then((exists) => {
      if (!cancelled) setEmailStatus(exists ? 'taken' : 'available');
    });
    return () => { cancelled = true; };
  }, [debouncedEmail, checkEmailExists]);

  const passwordStrength = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(formState.password),
  }));
  const isPasswordStrong = passwordStrength.every(r => r.met);
  const passwordsMatch = formState.password === formState.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading('google');
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Google sign-up failed. Please try again.');
      setSocialLoading(null);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formState.username || !formState.email || !formState.password || !formState.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formState.username.length < 2 || formState.username.length > 30) {
      setError('Username must be between 2 and 30 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_ ]+$/.test(formState.username)) {
      setError('Username can only contain letters, numbers, spaces, and underscores.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('This username is already taken.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (emailStatus === 'taken') {
      setError('An account with this email already exists.');
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!termsAgreed) {
      setError('Please select our terms and condition');
      return;
    }

    setLoading(true);
    try {
      await register(formState.email, formState.password, formState.username);
      setSuccess(true);
      requestNotificationPermission();
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('Too many registration attempts. Please wait before trying again.');
      } else if (msg.includes('already') || msg.includes('exists')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('weak') || msg.includes('Password')) {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (msg.includes('Network') || msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <p className="text-sl-gray-light/70 text-lg mt-1 font-medium">Create your account</p>
        </div>

          <motion.button
            onClick={handleGoogleSignUp}
            disabled={!!isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mb-6 shadow-lg shadow-black/10"
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
            <div className="flex flex-col items-start relative z-10">
              <span className="text-white font-medium text-base">Continue with Google</span>
              <span className="text-white/50 text-xs">Fastest way to get started</span>
            </div>
            {socialLoading === 'google' && (
              <svg className="w-4 h-4 animate-spin text-white/60 ml-auto relative z-10" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <svg className="w-4 h-4 text-white/30 ml-auto relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>

          
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm font-medium">or register with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-username" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                id="reg-username"
                type="text"
                name="username"
                value={formState.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Choose a username"
                required
                minLength={2}
                maxLength={30}
                disabled={isSubmitting}
              />
              {formState.username.length >= 2 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'available' && (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {usernameStatus === 'taken' && (
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {usernameStatus === 'invalid' && (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {(usernameStatus === null && formState.username.length >= 2) && (
                    <svg className="w-4 h-4 animate-spin text-white/30" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-red-400 text-xs mt-1">This username is already taken</p>
            )}
            {usernameStatus === 'invalid' && (
              <p className="text-amber-400 text-xs mt-1">Only letters, numbers, spaces, and underscores</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
              {formState.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus === 'available' && (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {emailStatus === 'taken' && (
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {emailStatus === null && (
                    <svg className="w-4 h-4 animate-spin text-white/30" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {emailStatus === 'taken' && (
              <p className="text-red-400 text-xs mt-1">An account with this email already exists</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formState.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Create a strong password"
                required
                minLength="8"
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
            {(focusedField === 'password' || formState.password.length > 0) && (
              <div className="mt-2 space-y-1">
                {passwordStrength.map((req, idx) => (
                  <div key={idx} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-emerald-400' : 'text-sl-gray-light/60'}`}>
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {req.met ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-sl-purple-light/80 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                className="holo-input w-full text-white placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Confirm your password"
                required
                minLength="8"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sl-gray-light/60 hover:text-sl-purple-light transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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
            {formState.confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className={`w-5 h-5 shrink-0 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              termsAgreed
                ? 'bg-sl-purple-light border-sl-purple-light'
                : 'bg-transparent border-white/20 group-hover:border-sl-purple-light/50'
            }`}>
              {termsAgreed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs text-white/50 leading-relaxed select-none group-hover:text-white/70 transition">
              I agree to the{' '}
              <Link to="/terms" className="text-sl-purple-light hover:text-sl-purple-light/80 underline underline-offset-2 transition font-semibold">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-sl-purple-light hover:text-sl-purple-light/80 underline underline-offset-2 transition font-semibold">
                Privacy Policy
              </Link>
            </span>
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="text-red-400 text-center text-sm bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="text-emerald-400 text-center text-sm bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20"
              >
                Account created! You can now sign in.
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSubmitting || !isPasswordStrong || !termsAgreed || !passwordsMatch || !formState.username || !formState.email}
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sl-purple-light hover:text-sl-purple-light/80 transition font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
