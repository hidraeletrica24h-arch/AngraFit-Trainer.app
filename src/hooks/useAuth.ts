import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';
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

  const loginClient = useCallback(async (clientId: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('password', password)
        .single();
        
      if (data && !error) {
        setAuth({
          isAuthenticated: true,
          userType: 'client',
          userId: data.id,
          userName: data.name
        });
        return true;
      }
    } catch (e) {
      console.error("Login Error: ", e);
    }
    return false;
  }, [setAuth]);

  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      userType: null,
      userId: null,
      userName: null
    });
  }, [setAuth]);

  const getCurrentClient = useCallback((clientsList: Client[]): Client | null => {
    if (auth.userType === 'client' && auth.userId) {
      return clientsList.find(c => c.id === auth.userId) || null;
    }
    return null;
  }, [auth]);

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
    getCurrentClient
  };
}
