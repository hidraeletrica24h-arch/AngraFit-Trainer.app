import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Client } from '../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform snake_case columns to camelCase for the app type
      const formattedClients: Client[] = (data || []).map(client => ({
        ...client,
        startDate: client.start_date,
        dueDate: client.due_date,
      }));
      
      setClients(formattedClients);
    } catch (e) {
      console.error('Erro ao buscar clientes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      // Convert camelCase app type to snake_case db columns
      const dbData = {
        name: clientData.name,
        age: clientData.age,
        height: clientData.height,
        weight: clientData.weight,
        goal: clientData.goal,
        level: clientData.level,
        plan: clientData.plan,
        start_date: clientData.startDate,
        due_date: clientData.dueDate,
        photo: clientData.photo,
        observations: clientData.observations,
        password: clientData.password,
        status: clientData.status,
        gender: clientData.gender
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        // Transform for app state
        const newClient: Client = {
          ...data,
          startDate: data.start_date,
          dueDate: data.due_date,
        };
        setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (e) {
      console.error('Erro ao adicionar cliente:', e);
      throw e;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const dbData: any = { ...updates };
      if (updates.startDate) dbData.start_date = updates.startDate;
      if (updates.dueDate) dbData.due_date = updates.dueDate;
      delete dbData.startDate;
      delete dbData.dueDate;

      const { error } = await supabase
        .from('clients')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) {
      console.error('Erro ao atualizar cliente:', e);
      throw e;
    }
  };

  const deleteClient = async (id: string) => {
    console.log("ID DO CLIENTE:", id);
    try {
      const { data, error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("Cliente removido:", data);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente");
    }
  };

  return { 
    clients, 
    isLoadingClients: isLoading,
    addClient, 
    updateClient, 
    deleteClient,
    refreshClients: fetchClients
  };
}
