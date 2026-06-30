import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { isCapacitor, ANDROID_REDIRECT_URL } from '../lib/capacitor';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function generateUsername(email) {
  let base = email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : 'user';
  if (base.length < 2) base = 'user' + base;
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}_${suffix}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const inactivityTimer = useRef(null);
  const sessionCheckTimer = useRef(null);
  const initializingGoogleUser = useRef(false);
  const pendingAuthRef = useRef(false);

  const clearTimers = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    if (sessionCheckTimer.current) {
      clearInterval(sessionCheckTimer.current);
      sessionCheckTimer.current = null;
    }
  };

  const checkAndInitializeGoogleUser = useCallback(async (currentUser) => {
    if (!currentUser || initializingGoogleUser.current) return;
    initializingGoogleUser.current = true;
    try {
      const email = currentUser.email;
      const metadata = currentUser.user_metadata || {};

      if (metadata.username) return;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existingProfile?.username) {
        await supabase.auth.updateUser({
          data: { username: existingProfile.username },
        });
        return;
      }

      const googleName = metadata.full_name || metadata.name || '';
      let base = googleName
        ? googleName.toLowerCase().replace(/[^a-z0-9_]/g, '').trim()
        : email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
      if (base.length < 2) base = 'user';
      const suffix = Math.random().toString(36).substring(2, 6);
      const username = `${base}_${suffix}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { username },
      });
      if (updateError) throw updateError;

      if (existingProfile) {
        await supabase
          .from('profiles')
          .update({ username, email })
          .eq('id', currentUser.id);
      } else {
        await supabase.from('profiles').insert({
          id: currentUser.id,
          email,
          username,
          level: 1,
          xp: 0,
          rank: 'Initiate',
        });
      }

      localStorage.setItem('sl_user_xp', '0');
      localStorage.setItem('sl_user_level', '1');
    } catch (err) {
      console.error('Failed to initialize Google user:', err);
    } finally {
      initializingGoogleUser.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setSessionExpiresAt(session?.expires_at ? session.expires_at * 1000 : null);
        setLoading(false);
        if (currentUser && currentUser.app_metadata?.provider === 'google') {
          checkAndInitializeGoogleUser(currentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSessionExpiresAt(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setUser(session.user ?? null);
        setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
        if (session.user && session.user.app_metadata?.provider === 'google') {
          checkAndInitializeGoogleUser(session.user);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimers();
    };
  }, [checkAndInitializeGoogleUser]);

  useEffect(() => {
    if (!isCapacitor) return;

    let listener;
    let handledUrls = new Set();

    const handleOAuthUrl = async (url) => {
      if (!url?.startsWith(ANDROID_REDIRECT_URL)) return;
      if (handledUrls.has(url)) return;
      handledUrls.add(url);

      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    const init = async () => {
      const { App } = await import('@capacitor/app');

      listener = await App.addListener('appUrlOpen', (event) => {
        handleOAuthUrl(event.url);
      });

      try {
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          handleOAuthUrl(launchUrl.url);
        }
      } catch (e) {
        // getLaunchUrl may throw if not available
      }
    };

    init();

    return () => {
      if (listener) listener.remove();
    };
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (user) {
      inactivityTimer.current = setTimeout(() => {
        supabase.auth.signOut();
        setUser(null);
        setError('Session expired due to inactivity. Please log in again.');
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      resetInactivityTimer();

      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));

      sessionCheckTimer.current = setInterval(async () => {
        if (sessionExpiresAt && Date.now() >= sessionExpiresAt - REFRESH_THRESHOLD_MS) {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !data.session) {
            await supabase.auth.signOut();
            setUser(null);
            setError('Session expired. Please log in again.');
          } else {
            setUser(data.session.user ?? null);
            setSessionExpiresAt(data.session.expires_at ? data.session.expires_at * 1000 : null);
          }
        }
      }, 60000);

      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        clearTimers();
      };
    } else {
      clearTimers();
    }
  }, [user, sessionExpiresAt, resetInactivityTimer]);



  const login = async (identifier, password) => {
    setError(null);
    pendingAuthRef.current = true;
    try {
      let email = identifier;

      if (!isEmail(identifier)) {
        const { data, error: lookupError } = await supabase.rpc('get_email_by_username', {
          input_username: identifier,
        });
        if (lookupError || !data) {
          throw new Error('Invalid login credentials');
        }
        email = data;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      pendingAuthRef.current = false;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      if (isCapacitor) {
        const originalOpen = window.open;
        window.open = () => null;

        let result;
        try {
          result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: ANDROID_REDIRECT_URL,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });
        } finally {
          window.open = originalOpen;
        }

        if (result.error) throw result.error;

        if (result.data?.url) {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({ url: result.data.url });
        }

        return result.data;
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) throw error;
        return data;
      }
    } catch (err) {
      const message = err.message || 'Google sign-in failed';
      setError(message);
      throw err;
    }
  };

  
  const register = async (email, password, username) => {
    setError(null);
    pendingAuthRef.current = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      pendingAuthRef.current = false;
    }
  };

  const checkUsernameExists = async (username) => {
    try {
      const { data, error } = await supabase.rpc('check_username_exists', {
        input_username: username,
      });
      if (error) return false;
      return data;
    } catch {
      return false;
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        input_email: email,
      });
      if (error) return false;
      return data;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      clearTimers();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      localStorage.removeItem('sl_user_xp');
      localStorage.removeItem('sl_user_level');
      localStorage.removeItem('sl_power_level');
      localStorage.removeItem('sl_weekly_change');
      localStorage.removeItem('gr_avatar');
      localStorage.removeItem('gr_avatar_type');
      localStorage.removeItem('gr_remember_identifier');
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const sendVerificationEmail = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendVerificationForEmail = async (email) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const message = err.message || 'Failed to resend verification';
      setError(message);
      throw err;
    }
  };

  const updateUser = async (userData) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser(userData);
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    signInWithGoogle,
    logout,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    resendVerificationForEmail,
    updateUser,
    checkUsernameExists,
    checkEmailExists,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
