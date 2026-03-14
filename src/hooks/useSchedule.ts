import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Schedule } from '@/types';

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*');

      if (error) throw error;

      const formattedSchedules: Schedule[] = (data || []).map(s => ({
        id: s.id,
        clientId: s.client_id,
        clientName: s.client_name,
        date: s.date,
        time: s.time,
        duration: s.duration,
        type: s.type,
        status: s.status,
        notes: s.notes
      }));
      setSchedules(formattedSchedules);
    } catch (e) {
      console.error('Erro ao buscar agendamentos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientSchedules = (clientId: string): Schedule[] => {
    return schedules.filter(s => s.clientId === clientId).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getSchedulesByDate = (date: string): Schedule[] => {
    return schedules.filter(s => s.date === date).sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  };

  const getUpcomingSchedules = (limit: number = 10): Schedule[] => {
    const now = new Date().toISOString();
    return schedules
      .filter(s => new Date(`${s.date}T${s.time}`) > new Date(now))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  };

  const addSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .insert([{
          client_id: schedule.clientId,
          client_name: schedule.clientName,
          date: schedule.date,
          time: schedule.time,
          duration: schedule.duration,
          type: schedule.type,
          status: schedule.status,
          notes: schedule.notes || ''
        }]);

      if (error) throw error;
      await fetchSchedules();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar agendamento:', e);
      throw e;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const dbUpdates: any = {};
      if (updates.clientId) dbUpdates.client_id = updates.clientId;
      if (updates.clientName) dbUpdates.client_name = updates.clientName;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.time) dbUpdates.time = updates.time;
      if (updates.duration) dbUpdates.duration = updates.duration;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('schedules')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchSchedules();
      return true;
    } catch (e) {
      console.error('Erro ao atualizar agendamento:', e);
      throw e;
    }
  };

  const markAsCompleted = async (id: string) => {
    return updateSchedule(id, { status: 'concluido' });
  };

  const cancelSchedule = async (id: string) => {
    return updateSchedule(id, { status: 'cancelado' });
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSchedules(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao remover agendamento:', e);
      throw e;
    }
  };

  const getWeekSchedules = (startDate: Date): Schedule[] => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate >= startDate && scheduleDate < endDate;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  return {
    schedules,
    isLoadingSchedules: isLoading,
    getClientSchedules,
    getSchedulesByDate,
    getUpcomingSchedules,
    addSchedule,
    updateSchedule,
    markAsCompleted,
    cancelSchedule,
    deleteSchedule,
    getWeekSchedules
  };
}
