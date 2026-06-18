import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage synchronously
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sl_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login function
  const login = (email) => {
    // In a real app, this would be an API call
    // For now, we'll simulate successful login with mock data
    const mockUser = {
      id: 1,
      email: email || 'user@sololeveling.com',
      name: 'Shadow Hunter'
    };

    localStorage.setItem('sl_user', JSON.stringify(mockUser));
    setUser(mockUser);

    // Return promise for async handling
    return Promise.resolve(mockUser);
  };

  // Register function
  const register = (email, name) => {
    // In a real app, this would be an API call
    // For now, we'll simulate successful registration
    const newUser = {
      id: Date.now(),
      email: email,
      name: name || 'New Hunter'
    };

    localStorage.setItem('sl_user', JSON.stringify(newUser));
    setUser(newUser);

    return Promise.resolve(newUser);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('sl_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};