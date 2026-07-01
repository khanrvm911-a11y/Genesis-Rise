import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = 'support.app@gmail.com';
const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const checkingRef = useRef(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  const checkAdminStatus = useCallback(async (userId, userEmail) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const { data, error: rpcError } = await supabase.rpc('is_admin', { check_user_id: userId });
      if (rpcError) throw rpcError;
      const adminStatus = !!data || userEmail === ADMIN_EMAIL;
      setIsAdmin(adminStatus);
      if (!adminStatus) setError('Access denied. Admin privileges required.');
    } catch (err) {
      console.error('Admin check error:', err);
      const adminStatus = userEmail === ADMIN_EMAIL;
      setIsAdmin(adminStatus);
      if (!adminStatus) setError('Access denied. Admin privileges required.');
    } finally {
      checkingRef.current = false;
      setLoading(false);
    }
  }, []);

  const refreshAdminStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setAdminUser(user);
      await checkAdminStatus(user.id, user.email);
    } else {
      setAdminUser(null);
      setIsAdmin(false);
      setLoading(false);
      setError('Not authenticated');
    }
  }, [checkAdminStatus]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser(user);
        await checkAdminStatus(user.id, user.email);
      } else {
        setLoading(false);
        setError('Not authenticated');
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAdminUser(session.user);
        checkAdminStatus(session.user.id, session.user.email);
      } else {
        setAdminUser(null);
        setIsAdmin(false);
        setLoading(false);
        setError('Not authenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  const logAction = useCallback(async (action, targetType, targetId, details = {}) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_details: details,
      });
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdmin, loading, error, refreshAdminStatus, logAction }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
