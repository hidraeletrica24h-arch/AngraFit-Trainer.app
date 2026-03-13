import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { AuthState, Client } from '@/types';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '2486'
};

export function useAuth() {
  const [auth, setAuth] = useLocalStorage<AuthState>('angrafit_auth', {
    isAuthenticated: false,
    userType: null,
    userId: null,
    userName: null
  });

  const [clients, setClients] = useLocalStorage<Client[]>('angrafit_clients', []);

  const loginAdmin = useCallback((username: string, password: string): boolean => {
    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = password.trim();
    
    if (normalizedUser === ADMIN_CREDENTIALS.username && normalizedPass === ADMIN_CREDENTIALS.password) {
      setAuth({
        isAuthenticated: true,
        userType: 'admin',
        userId: 'admin',
        userName: 'Administrador'
      });
      return true;
    }
    return false;
  }, [setAuth]);

  const loginClient = useCallback((clientId: string, password: string): boolean => {
    const client = clients.find(c => c.id === clientId && c.password === password);
    if (client) {
      setAuth({
        isAuthenticated: true,
        userType: 'client',
        userId: client.id,
        userName: client.name
      });
      return true;
    }
    return false;
  }, [clients, setAuth]);

  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      userType: null,
      userId: null,
      userName: null
    });
  }, [setAuth]);

  const getCurrentClient = useCallback((): Client | null => {
    if (auth.userType === 'client' && auth.userId) {
      return clients.find(c => c.id === auth.userId) || null;
    }
    return null;
  }, [auth, clients]);

  const isAdmin = auth.userType === 'admin';
  const isClient = auth.userType === 'client';

  return {
    isAuthenticated: auth.isAuthenticated,
    userType: auth.userType,
    userId: auth.userId,
    userName: auth.userName,
    isAdmin,
    isClient,
    loginAdmin,
    loginClient,
    logout,
    getCurrentClient,
    clients,
    setClients
  };
}
