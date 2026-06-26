import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (!mounted) return;
          setNotifications(prev => {
            const exists = prev.some(n => n.id === payload.new.id);
            return exists ? prev : [payload.new, ...prev];
          });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (!mounted) return;
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
          );
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (!mounted) return;
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe();

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        if (mounted) setNotifications(data || []);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addNotification = useCallback(async (title, message, category, icon, actionLink) => {
    if (!user) return;

    const newNotification = {
      user_id: user.id,
      title,
      message: message || '',
      category: category || 'system',
      icon: icon || 'Bell',
      read: false,
      action_link: actionLink || null,
      created_at: new Date().toISOString(),
    };

    const tempId = `temp-${Date.now()}`;
    setNotifications(prev => [{ ...newNotification, id: tempId }, ...prev]);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotification])
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === tempId ? { ...n, id: data.id } : n)
      );
    } catch (err) {
      console.error('Error adding notification:', err);
      setNotifications(prev => prev.filter(n => n.id !== tempId));
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .in('id', unreadIds);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [user, notifications]);

  const clearAll = useCallback(async () => {
    if (!user) return;

    const allIds = notifications.map(n => n.id);
    if (allIds.length === 0) return;

    setNotifications([]);

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .in('id', allIds);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications(data || []);
    }
  }, [user, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
