import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      navigate('/', { replace: true });
    } catch (err) {
      // Show specific error messages based on the error
      if (err.message.includes('Email does not exist')) {
        setError(err.message); // "Email does not exist. Please register your account."
      } else if (err.message.includes('Wrong password')) {
        setError(err.message); // "Wrong password"
      } else {
        setError('Invalid email or password'); // Fallback
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center gradient-text animate-pulse-red">
            Solo Leveling
          </h2>
          <p className="text-center text-sl-gray-light">
            Login to continue your journey
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formState.password}
                onChange={handleChange}
                className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white pr-10"
                placeholder="Enter your password"
                required
                minLength="6"
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
            Don't have an account?{' '}
            <Link to="/register" className="text-sl-purple-light hover:text-sl-purple/70 transition">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;