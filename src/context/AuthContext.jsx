import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const inactivityTimer = useRef(null);
  const sessionCheckTimer = useRef(null);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user ?? null);
        setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
      } else {
        setUser(null);
        setSessionExpiresAt(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionExpiresAt(session?.expires_at ? session.expires_at * 1000 : null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimers();
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

  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      supabase.auth.signOut().then(() => {
        setUser(null);
        setError('Please verify your email before logging in. A verification link has been sent to your email.');
      });
    }
  }, [user]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please verify your email before logging in. A verification link has been sent to your email.');
      }
      return data;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const register = async (email, password, username) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw err;
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
        password: password,
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
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
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
    logout,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    updateUser,
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
