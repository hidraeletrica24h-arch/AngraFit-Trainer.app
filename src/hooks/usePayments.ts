import { useLocalStorage } from './useLocalStorage';
import type { Payment } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useLocalStorage<Payment[]>('angrafit_payments', []);

  const getClientPayments = (clientId: string): Payment[] => {
    return payments.filter(p => p.clientId === clientId);
  };

  const getPendingPayments = (): Payment[] => {
    return payments.filter(p => p.status === 'pendente' || p.status === 'atrasado');
  };

  const getTotalRevenue = (): number => {
    return payments
      .filter(p => p.status === 'pago')
      .reduce((total, p) => total + p.amount, 0);
  };

  const addPayment = (payment: Omit<Payment, 'id'>): Payment => {
    const newPayment: Payment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>): boolean => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  };

  const markAsPaid = (id: string): boolean => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'pago' as const, paidDate: new Date().toISOString() } : p
    ));
    return true;
  };

  const requestConfirmation = (id: string): boolean => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'aguardando_confirmacao' as const } : p
    ));
    return true;
  };

  const confirmPayment = (id: string): boolean => {
    return markAsPaid(id);
  };

  const markAsPending = (id: string): boolean => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'pendente' as const, paidDate: undefined } : p
    ));
    return true;
  };

  const deletePayment = (id: string): boolean => {
    setPayments(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const checkOverduePayments = (): void => {
    const today = new Date().toISOString().split('T')[0];
    setPayments(prev => prev.map(p => {
      if (p.status === 'pendente' && p.dueDate < today) {
        return { ...p, status: 'atrasado' };
      }
      return p;
    }));
  };

  return {
    payments,
    getClientPayments,
    getPendingPayments,
    getTotalRevenue,
    addPayment,
    updatePayment,
    markAsPaid,
    requestConfirmation,
    confirmPayment,
    markAsPending,
    deletePayment,
    checkOverduePayments
  };
}
