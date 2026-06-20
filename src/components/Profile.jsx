import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLevel } from '../context/LevelContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const { level, xp, progress, xpForNext } = useLevel();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

        if (data) {
          setProfile(data);
        } else {
          setError('Profile not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getRankFromLevel = (level) => {
    const ranks = ['Novice', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Champion', 'Legend'];
    const index = Math.min(Math.floor((level - 1) / 10), ranks.length - 1);
    return ranks[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sl-gradient flex items-center justify-center">
        <div className="text-sl-gray-light">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sl-gradient flex items-center justify-center">
        <div className="text-red-500">{error}</div>
        <Link to="/" className="holo-button mt-4">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sl-gradient flex min-h-flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 bg-sl-dark/50 backdrop-blur-md rounded-sl-lg p-6 border border-sl-purple/20 shadow-sl-glow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-center gradient-text animate-pulse-red">
            Genesis Rise
          </h2>
          <p className="text-center text-sl-gray-light">
            Champion Profile
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="text-center">
            {profile?.username && (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-14 h-14 bg-sl-purple/20 rounded-full flex items-center justify-center">
                  <span className="text-sl-purple-light font-bold text-xl">{profile.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sl-purple-light font-semibold">{profile.username}</p>
                  <p className="text-sl-gray-light/50 text-xs">{user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Level and XP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sl-purple-light">
              <span>Level</span>
              <span className="font-bold">{level}</span>
            </div>
            <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000`} style={{ width: `${progress * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-sm text-sl-gray-light/50">
              <span>{xp} XP</span>
              <span>{Math.floor(progress * 100)}% to next level</span>
            </div>
          </div>

          {/* Rank */}
          <div className="border-t border-sl-purple/10 pt-4">
            <p className="text-sl-gray-light/50 text-sm">Rank</p>
            <p className="text-sl-purple-light font-bold text-lg">{profile?.rank || getRankFromLevel(level)}</p>
          </div>

          {/* Stats */}
          <div className="border-t border-sl-purple/10 pt-4">
            <p className="text-sl-gray-light/50 text-sm">Member Since</p>
            <p className="text-sl-gray-light">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="holo-button w-full">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;