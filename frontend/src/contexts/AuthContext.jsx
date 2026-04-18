import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { cleanupLegacyCartStorage, notifyCartContextChanged } from '../utils/cart';

export const AuthContext = createContext(null);

function persistAuth(data) {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.user));
}

function clearAuthStorage() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

const preloaders = {
  admin: () => import('../pages/admin/AdminDashboardPage'),
  cook: () => import('../pages/cook/CookDashboardPage'),
  delivery: () => import('../pages/delivery/DeliveryDashboardPage'),
  server: () => import('../pages/server/ServerDashboardPage'),
  client: () => import('../pages/client/ProfilePage'),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem('auth_token')) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/user');
      setUser(data);
      localStorage.setItem('auth_user', JSON.stringify(data));
    } catch {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cleanupLegacyCartStorage();
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      persistAuth(data);
      setToken(data.token);
      setUser(data.user);
      notifyCartContextChanged();
      toast.success('Connexion reussie');
      return data.user;
    } catch (error) {
      const message = error?.response?.data?.message || 'Echec de connexion';
      toast.error(message);
      throw error;
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      persistAuth(data);
      setToken(data.token);
      setUser(data.user);
      notifyCartContextChanged();
      toast.success('Compte cree');
      return data.user;
    } catch (error) {
      const message = error?.response?.data?.message || 'Echec de creation du compte';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // noop
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
      notifyCartContextChanged();
      toast.success('Deconnecte');
    }
  }, []);

  const preloadRolePages = useCallback(() => {
    if (user?.role && preloaders[user.role]) {
      preloaders[user.role]();
    }
  }, [user]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, preloadRolePages, refreshUser: fetchUser }),
    [fetchUser, loading, login, logout, preloadRolePages, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
