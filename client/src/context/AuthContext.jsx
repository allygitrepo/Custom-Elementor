import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupStatus, setSetupStatus] = useState({
    checked: false,
    isInstalled: false,
    requirements: null,
    canInstall: false
  });

  const checkStatusAndAuth = async () => {
    try {
      setLoading(true);
      // 1. Check setup status first
      const setup = await api.getSetupStatus();
      setSetupStatus({
        checked: true,
        isInstalled: setup.is_installed,
        requirements: setup.requirements,
        canInstall: setup.can_install
      });

      // 2. If installed, check current user session/token
      if (setup.is_installed && api.token) {
        try {
          const authData = await api.getMe();
          setUser(authData.user);
        } catch (e) {
          api.setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to initialize app state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    api.setToken(null);
    setUser(null);
  };

  const install = async (formData) => {
    const data = await api.install(formData);
    api.setToken(data.token);
    setUser(data.user);
    setSetupStatus(prev => ({ ...prev, isInstalled: true }));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setupStatus,
        login,
        logout,
        install,
        refresh: checkStatusAndAuth
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
