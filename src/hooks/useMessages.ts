import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(m => ({
        id: m.id,
        clientId: m.client_id,
        title: m.title,
        content: m.content,
        type: m.type,
        date: m.date,
        read: m.read
      }));
      setMessages(formattedMessages);
    } catch (e) {
      console.error('Erro ao buscar mensagens:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientMessages = (clientId: string): Message[] => {
    return messages.filter(m => m.clientId === clientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getUnreadCount = (clientId: string): number => {
    return messages.filter(m => m.clientId === clientId && !m.read).length;
  };

  const addMessage = async (message: Omit<Message, 'id' | 'date' | 'read'>) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          client_id: message.clientId,
          title: message.title,
          content: message.content,
          type: message.type
        }]);

      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar mensagem:', e);
      throw e;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (e) {
      console.error('Erro ao marcar mensagem como lida:', e);
      throw e;
    }
  };

  const markAllAsRead = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('client_id', clientId);

      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (e) {
      console.error('Erro ao marcar todas as mensagens como lidas:', e);
      throw e;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao excluir mensagem:', e);
      throw e;
    }
  };

  const getMessageTypeLabel = (type: Message['type']): string => {
    const labels: Record<Message['type'], string> = {
      aviso: 'Aviso',
      instrucao: 'Instrução',
      lembrete: 'Lembrete',
      motivacional: 'Motivacional'
    };
    return labels[type];
  };

  const getMessageTypeColor = (type: Message['type']): string => {
    const colors: Record<Message['type'], string> = {
      aviso: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      instrucao: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      lembrete: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      motivacional: 'text-green-400 bg-green-400/10 border-green-400/30'
    };
    return colors[type];
  };

  return {
    messages,
    isLoadingMessages: isLoading,
    getClientMessages,
    getUnreadCount,
    addMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getMessageTypeLabel,
    getMessageTypeColor
  };
}
