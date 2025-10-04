import { createContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la comprobación de una sesión existente al cargar la app
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await loginService(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (email, password) => {
    const userData = await registerService(email, password);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};