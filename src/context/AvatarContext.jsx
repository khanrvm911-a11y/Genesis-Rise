import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const { user } = useAuth();
  const prevUserRef = useRef(user);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('gr_avatar') || null);
  const [avatarType, setAvatarType] = useState(() => localStorage.getItem('gr_avatar_type') || 'initial');
  const [loadedFromDb, setLoadedFromDb] = useState(false);

  useEffect(() => {
    if (!user) {
      setAvatar(null);
      setAvatarType('initial');
      setLoadedFromDb(false);
      prevUserRef.current = null;
      return;
    }
    prevUserRef.current = user;

    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar, avatar_type')
          .eq('id', user.id)
          .single();

        if (data?.avatar_type) {
          setAvatar(data.avatar);
          setAvatarType(data.avatar_type);
          localStorage.setItem('gr_avatar', data.avatar || '');
          localStorage.setItem('gr_avatar_type', data.avatar_type || 'initial');
        } else {
          const localAvatar = localStorage.getItem('gr_avatar');
          const localType = localStorage.getItem('gr_avatar_type');
          if (localType && localType !== 'initial') {
            setAvatar(localAvatar);
            setAvatarType(localType);
          }
        }
      } catch {
        const localAvatar = localStorage.getItem('gr_avatar');
        const localType = localStorage.getItem('gr_avatar_type');
        if (localType) {
          setAvatar(localAvatar);
          setAvatarType(localType);
        }
      } finally {
        setLoadedFromDb(true);
      }
    })();
  }, [user]);

  const updateAvatar = useCallback((newAvatar, newType) => {
    localStorage.setItem('gr_avatar', newAvatar || '');
    localStorage.setItem('gr_avatar_type', newType || 'initial');
    setAvatar(newAvatar);
    setAvatarType(newType);

    if (user) {
      supabase
        .from('profiles')
        .update({ avatar: newAvatar || null, avatar_type: newType || 'initial' })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to save avatar:', error);
        });
    }
  }, [user]);

  return (
    <AvatarContext.Provider value={{ avatar, avatarType, updateAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) throw new Error('useAvatar must be used within AvatarProvider');
  return context;
}
