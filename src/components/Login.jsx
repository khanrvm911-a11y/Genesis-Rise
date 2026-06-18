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
      await login(formState.email);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Invalid email or password');
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
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
              placeholder="Enter your password"
              required
              minLength="6"
            />
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