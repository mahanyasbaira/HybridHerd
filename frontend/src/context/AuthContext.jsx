import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('auth_token').then(stored => {
      if (stored) {
        const parsed = JSON.parse(stored);
        setToken(parsed.token);
        setUser(parsed.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      }
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('auth_token', JSON.stringify({ token: t, user: u }));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  }

  async function logout() {
    await AsyncStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
