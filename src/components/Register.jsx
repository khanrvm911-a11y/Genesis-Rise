import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
    name: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formState.email || !formState.password || !formState.name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(formState.email, formState.name);
      setSuccess(true);
      // Auto-login after registration
      navigate('/', { replace: true });
    } catch (err) {
      setError('Registration failed. Please try again.');
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
            Create your hunter profile
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
              placeholder="Enter your name"
              required
            />
          </div>

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
              placeholder="Create password"
              required
              minLength="6"
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="text-emerald-400 text-center text-sm">
              Registration successful! Redirecting...
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`holo-button w-full py-3 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Awaken Your Power'}
          </button>
        </form>

        <div className="text-center text-sl-gray-light/50 mt-6">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-sl-purple-light hover:text-sl-purple/70 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;