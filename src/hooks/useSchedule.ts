import { useLocalStorage } from './useLocalStorage';
import type { Schedule } from '@/types';

export function useSchedule() {
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('angrafit_schedules', []);

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

  const addSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>): boolean => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    return true;
  };

  const markAsCompleted = (id: string): boolean => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'concluido' as const } : s
    ));
    return true;
  };

  const cancelSchedule = (id: string): boolean => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'cancelado' as const } : s
    ));
    return true;
  };

  const deleteSchedule = (id: string): boolean => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    return true;
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
