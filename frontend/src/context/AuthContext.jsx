import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartbuy_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('smartbuy_access_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      setAccessToken(localStorage.getItem('smartbuy_access_token') || null);
      try {
        const saved = localStorage.getItem('smartbuy_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setUser(null);
      }
    };

    window.addEventListener('smartbuy_auth_change', handleAuthChange);
    return () => window.removeEventListener('smartbuy_auth_change', handleAuthChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (accessToken) {
      getCurrentUser()
        .then((userData) => {
          if (isMounted) {
            setUser(userData);
            localStorage.setItem('smartbuy_user', JSON.stringify(userData));
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('smartbuy_access_token');
            localStorage.removeItem('smartbuy_refresh_token');
            localStorage.removeItem('smartbuy_user');
            setLoading(false);
          }
        });
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const login = async (username, password) => {
    const data = await loginUser({ username, password });
    if (data.access && data.refresh && data.user) {
      localStorage.setItem('smartbuy_access_token', data.access);
      localStorage.setItem('smartbuy_refresh_token', data.refresh);
      localStorage.setItem('smartbuy_user', JSON.stringify(data.user));
      setAccessToken(data.access);
      setUser(data.user);
      window.dispatchEvent(new Event('smartbuy_auth_change'));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data.access && data.refresh && data.user) {
      localStorage.setItem('smartbuy_access_token', data.access);
      localStorage.setItem('smartbuy_refresh_token', data.refresh);
      localStorage.setItem('smartbuy_user', JSON.stringify(data.user));
      setAccessToken(data.access);
      setUser(data.user);
      window.dispatchEvent(new Event('smartbuy_auth_change'));
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('smartbuy_access_token');
    localStorage.removeItem('smartbuy_refresh_token');
    localStorage.removeItem('smartbuy_user');
    setAccessToken(null);
    setUser(null);
    window.dispatchEvent(new Event('smartbuy_auth_change'));
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...userData };
      localStorage.setItem('smartbuy_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
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
