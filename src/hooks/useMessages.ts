import { useLocalStorage } from './useLocalStorage';
import type { Message } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useLocalStorage<Message[]>('angrafit_messages', []);

  const getClientMessages = (clientId: string): Message[] => {
    return messages.filter(m => m.clientId === clientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getUnreadCount = (clientId: string): number => {
    return messages.filter(m => m.clientId === clientId && !m.read).length;
  };

  const addMessage = (message: Omit<Message, 'id' | 'date' | 'read'>): Message => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const markAsRead = (id: string): boolean => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    return true;
  };

  const markAllAsRead = (clientId: string): boolean => {
    setMessages(prev => prev.map(m => 
      m.clientId === clientId ? { ...m, read: true } : m
    ));
    return true;
  };

  const deleteMessage = (id: string): boolean => {
    setMessages(prev => prev.filter(m => m.id !== id));
    return true;
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
