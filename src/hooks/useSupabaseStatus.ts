import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Verificando status real de conexão do Supabase
export function useSupabaseStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Ping real para o Supabase a cada 30 segundos
    const checkConnection = async () => {
      try {
        // Tentamos uma chamada de sessão leve ou checar saúde da conexão
        const { error } = await supabase.auth.getSession();
        
        if (error && error.message.includes('Failed to fetch')) {
          setIsOnline(false);
        } else {
          setIsOnline(true);
        }
      } catch (error) {
        setIsOnline(false);
      } finally {
        setLastChecked(new Date());
      }
    };

    // Checa inicialmente
    checkConnection();

    // Configura o intervalo
    const interval = setInterval(checkConnection, 30000); // 30 segundos
    
    // Listeners nativos do navegador como fallback imediato
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  return { isOnline, lastChecked };
}
