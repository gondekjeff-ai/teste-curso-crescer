import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: User; isAdmin: boolean }>('/auth/me');
      setUser(data.user);
      setIsAdmin(data.isAdmin);
    } catch {
      api.setToken(null);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      api.setToken(data.token);
      setUser(data.user);
      setIsAdmin(true);
    }
    return data;
  };

  const signOut = async () => {
    api.setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  return { user, loading, isAdmin, signIn, signOut };
};
