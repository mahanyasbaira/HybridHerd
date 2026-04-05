import { createContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('hh_token');
    const storedUser = localStorage.getItem('hh_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await apiLogin(email, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('hh_token', token);
    localStorage.setItem('hh_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
    return userData;
  }, [navigate]);

  const register = useCallback(async (email, password, role) => {
    const response = await apiRegister(email, password, role);
    const { token, user: userData } = response.data;
    localStorage.setItem('hh_token', token);
    localStorage.setItem('hh_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
    return userData;
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
