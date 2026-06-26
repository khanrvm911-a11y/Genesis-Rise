import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(() => localStorage.getItem('gr_avatar') || null);
  const [avatarType, setAvatarType] = useState(() => localStorage.getItem('gr_avatar_type') || 'initial');

  useEffect(() => {
    if (!user) {
      setAvatar(null);
      setAvatarType('initial');
    }
  }, [user]);

  const updateAvatar = (newAvatar, newType) => {
    localStorage.setItem('gr_avatar', newAvatar);
    localStorage.setItem('gr_avatar_type', newType);
    setAvatar(newAvatar);
    setAvatarType(newType);
  };

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
