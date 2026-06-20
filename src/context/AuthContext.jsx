import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage synchronously
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sl_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login function
  const login = (email, password) => {
    // Try to load existing user for this email
    const stored = localStorage.getItem('sl_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email === email) {
        // Validate password
        // In a real app, you would compare hashed passwords
        // For this demo, we'll store password in plain text for simplicity
        // NOTE: In production, always hash passwords and compare hashes
        if (parsed.password === password) {
          setUser(parsed);
          return Promise.resolve(parsed);
        } else {
          return Promise.reject(new Error('Wrong password'));
        }
      }
    }
    // If no user found with this email
    return Promise.reject(new Error('Email does not exist. Please register your account.'));
  };

  // Register function
  const register = (email, name, password) => {
    // In a real app, this would be an API call
    // For now, we'll simulate successful registration
    const newUser = {
      id: Date.now(),
      email: email,
      name: name || 'New Hunter',
      password: password // Store password (in production, use hashed password)
    };

    localStorage.setItem('sl_user', JSON.stringify(newUser));
    setUser(newUser);

    return Promise.resolve(newUser);
  };

  // Logout function
  const logout = () => {
    // Keep user data in localStorage for persistence across sessions
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