import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Payment } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });

      if (error) throw error;

      const formattedPayments: Payment[] = (data || []).map(p => ({
        id: p.id,
        clientId: p.client_id,
        clientName: p.client_name,
        amount: Number(p.amount),
        dueDate: p.due_date,
        paidDate: p.paid_date,
        status: p.status,
        method: p.method,
        pixKey: p.pix_key,
        paymentLink: p.payment_link,
        description: p.description
      }));
      setPayments(formattedPayments);
    } catch (e) {
      console.error('Erro ao buscar pagamentos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientPayments = (clientId: string): Payment[] => {
    return payments.filter(p => p.clientId === clientId);
  };

  const getPendingPayments = (): Payment[] => {
    return payments.filter(p => ['pendente', 'atrasado'].includes(p.status));
  };

  const getTotalRevenue = (): number => {
    return payments
      .filter(p => p.status === 'pago')
      .reduce((total, p) => total + Number(p.amount), 0);
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const dbPayment = {
        client_id: payment.clientId,
        client_name: payment.clientName,
        amount: payment.amount,
        due_date: payment.dueDate,
        paid_date: payment.paidDate || null,
        status: payment.status,
        method: payment.method,
        pix_key: payment.pixKey || null,
        payment_link: payment.paymentLink || null,
        description: payment.description
      };

      const { error } = await supabase
        .from('payments')
        .insert([dbPayment]);

      if (error) throw error;
      await fetchPayments();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar pagamento:', e);
      throw e;
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.clientId) dbUpdates.client_id = updates.clientId;
      if (updates.clientName) dbUpdates.client_name = updates.clientName;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.method) dbUpdates.method = updates.method;
      if (updates.pixKey !== undefined) dbUpdates.pix_key = updates.pixKey;
      if (updates.paymentLink !== undefined) dbUpdates.payment_link = updates.paymentLink;
      if (updates.description !== undefined) dbUpdates.description = updates.description;

      const { error } = await supabase
        .from('payments')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchPayments();
      return true;
    } catch (e) {
      console.error('Erro ao atualizar pagamento:', e);
      throw e;
    }
  };

  const markAsPaid = async (id: string) => {
    return updatePayment(id, { 
      status: 'pago', 
      paidDate: new Date().toISOString() 
    });
  };

  const requestConfirmation = async (id: string) => {
    return updatePayment(id, { 
      status: 'aguardando_confirmacao' 
    });
  };

  const confirmPayment = async (id: string) => {
    return markAsPaid(id);
  };

  const markAsPending = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'pendente', paid_date: null })
        .eq('id', id);

      if (error) throw error;
      await fetchPayments();
      return true;
    } catch (e) {
      console.error('Erro ao marcar pagamento como pendente:', e);
      throw e;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPayments(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao excluir pagamento:', e);
      throw e;
    }
  };

  const checkOverduePayments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const overduePayments = payments.filter(p => p.status === 'pendente' && p.dueDate < today);
      
      if (overduePayments.length === 0) return;

      for (const p of overduePayments) {
        await supabase
          .from('payments')
          .update({ status: 'atrasado' })
          .eq('id', p.id);
      }
      
      await fetchPayments();
    } catch (e) {
      console.error('Erro ao checar pagamentos atrasados:', e);
    }
  };

  useEffect(() => {
    if (payments.length > 0) {
      // Check overdue when payments change (but debounced or only once per session typically)
      // For simplicity, we just trigger it if needed or let the component call it
    }
  }, []);

  return {
    payments,
    isLoadingPayments: isLoading,
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
