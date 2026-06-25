import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const hasSpecialChar = (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p);

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character', test: hasSpecialChar },
];

const ResetPassword = () => {
  const location = useLocation();

  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('access_token') || '';
  };

  const [accessToken] = useState(getTokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const passwordStrength = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password),
  }));

  const isPasswordStrong = passwordStrength.every(r => r.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!accessToken) {
      setError('Invalid or expired link');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token: accessToken,
        type: 'recovery',
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });
      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('invalid token') || msg.includes('expired')) {
        setError('Invalid or expired link. Please request a new reset link.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
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
            Reset your password
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Enter new password (min 12 chars)"
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
            {(focusedField === 'password' || password.length > 0) && (
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
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Confirm new password"
                required
                minLength="12"
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
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="text-emerald-400 text-center text-sm">
              Password has been reset successfully. You can now log in.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isPasswordStrong}
            className={`holo-button w-full py-3 ${(loading || !isPasswordStrong) ? 'opacity-70' : ''}`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
