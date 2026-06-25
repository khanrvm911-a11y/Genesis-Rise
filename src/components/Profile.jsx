import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLevel } from '../context/LevelContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { level, xp, progress, xpForNext } = useLevel();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, level, xp, rank, created_at')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
          setLoading(false);
          return;
        }

        if (data) setProfile(data);
        else setError('Profile not found');
      } finally { setLoading(false); }
    };

    fetchProfile();
  }, [user]);

  const getTitleFromLevel = (level) => {
    const titles = ['Novice', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Elite', 'Legend'];
    const index = Math.min(Math.floor((level - 1) / 10), titles.length - 1);
    return titles[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sl-gradient flex items-center justify-center">
        <div className="text-sl-gray-light">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sl-gradient flex flex-col items-center justify-center px-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/" className="holo-button">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <Link to="/" className="flex items-center gap-1 text-sl-gray-light hover:text-white text-sm mb-4 touch-target w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="mobile-card p-6 text-center mb-4">
          <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-sl-purple/30 shadow-sl-glow">
            <span className="text-sl-purple-light font-bold text-2xl">
              {(profile?.username || user?.email || 'C').charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold gradient-text mb-1">Genesis Rise</h2>
          {profile?.username && (
            <p className="text-sl-purple-light font-semibold">{profile.username}</p>
          )}
          {user?.email && <p className="text-xs text-sl-gray-light/50 mt-0.5">{user.email}</p>}
        </div>

        <div className="mobile-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-sl-purple-light font-semibold">Level</span>
            <span className="text-lg font-bold text-white">{level}</span>
          </div>
          <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden mb-2">
            <div className={`h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000`} style={{ width: `${progress * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-sl-gray-light/70">
            <span>{xp} XP</span>
            <span>{Math.floor(progress * 100)}%</span>
          </div>
        </div>

        <div className="mobile-card p-5 mb-4">
          <div className="flex items-center justify-between border-b border-sl-purple/10 pb-3 mb-3">
            <span className="text-sm text-sl-gray-light/70">Title</span>
            <span className="text-sl-purple-light font-bold flex items-center gap-1">
              <Crown className="w-4 h-4" />
              {profile?.title || getTitleFromLevel(level)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-sl-gray-light/70">Member Since</span>
            <span className="text-sm text-sl-gray-light">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>

        <Link to="/" className="holo-button w-full text-center py-3 text-sm">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;
