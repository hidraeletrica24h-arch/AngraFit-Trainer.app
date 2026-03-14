import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Progress } from '@/types';

export function useProgress() {
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*');

      if (error) throw error;

      const formattedProgress: Progress[] = (data || []).map(p => ({
        id: p.id,
        clientId: p.client_id,
        date: p.date,
        weight: Number(p.weight),
        bodyFat: p.body_fat ? Number(p.body_fat) : undefined,
        muscleMass: p.muscle_mass ? Number(p.muscle_mass) : undefined,
        measurements: {
          chest: p.chest ? Number(p.chest) : undefined,
          waist: p.waist ? Number(p.waist) : undefined,
          hips: p.hips ? Number(p.hips) : undefined,
          arms: p.arms ? Number(p.arms) : undefined,
          thighs: p.thighs ? Number(p.thighs) : undefined,
        }
      }));
      setProgressData(formattedProgress);
    } catch (e) {
      console.error('Erro ao buscar progresso:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientProgress = (clientId: string): Progress[] => {
    return progressData
      .filter(p => p.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getLatestProgress = (clientId: string): Progress | null => {
    const clientProgress = getClientProgress(clientId);
    return clientProgress.length > 0 ? clientProgress[clientProgress.length - 1] : null;
  };

  const addProgress = async (progress: Omit<Progress, 'id'>) => {
    try {
      const { error } = await supabase
        .from('progress')
        .insert([{
          client_id: progress.clientId,
          date: progress.date,
          weight: progress.weight,
          body_fat: progress.bodyFat || null,
          muscle_mass: progress.muscleMass || null,
          chest: progress.measurements?.chest || null,
          waist: progress.measurements?.waist || null,
          hips: progress.measurements?.hips || null,
          arms: progress.measurements?.arms || null,
          thighs: progress.measurements?.thighs || null
        }]);

      if (error) throw error;
      await fetchProgressData();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar progresso:', e);
      throw e;
    }
  };

  const updateProgress = async (id: string, updates: Partial<Progress>) => {
    try {
      const dbUpdates: any = {};
      if (updates.clientId) dbUpdates.client_id = updates.clientId;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
      if (updates.bodyFat !== undefined) dbUpdates.body_fat = updates.bodyFat;
      if (updates.muscleMass !== undefined) dbUpdates.muscle_mass = updates.muscleMass;
      if (updates.measurements) {
        if (updates.measurements.chest !== undefined) dbUpdates.chest = updates.measurements.chest;
        if (updates.measurements.waist !== undefined) dbUpdates.waist = updates.measurements.waist;
        if (updates.measurements.hips !== undefined) dbUpdates.hips = updates.measurements.hips;
        if (updates.measurements.arms !== undefined) dbUpdates.arms = updates.measurements.arms;
        if (updates.measurements.thighs !== undefined) dbUpdates.thighs = updates.measurements.thighs;
      }

      const { error } = await supabase
        .from('progress')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await fetchProgressData();
      return true;
    } catch (e) {
      console.error('Erro ao atualizar progresso:', e);
      throw e;
    }
  };

  const deleteProgress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('progress')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProgressData();
      return true;
    } catch (e) {
      console.error('Erro ao excluir progresso:', e);
      throw e;
    }
  };

  const getWeightChartData = (clientId: string) => {
    const data = getClientProgress(clientId);
    return {
      labels: data.map(p => new Date(p.date).toLocaleDateString('pt-BR')),
      datasets: [{
        label: 'Peso (kg)',
        data: data.map(p => p.weight),
        borderColor: 'hsl(0 85% 55%)',
        backgroundColor: 'hsl(0 85% 55% / 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getBodyCompositionChartData = (clientId: string) => {
    const data = getClientProgress(clientId).filter(p => p.bodyFat || p.muscleMass);
    return {
      labels: data.map(p => new Date(p.date).toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: '% Gordura',
          data: data.map(p => p.bodyFat || 0),
          borderColor: 'hsl(0 85% 55%)',
          backgroundColor: 'hsl(0 85% 55% / 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Massa Magra (kg)',
          data: data.map(p => p.muscleMass || 0),
          borderColor: 'hsl(142 76% 45%)',
          backgroundColor: 'hsl(142 76% 45% / 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const getStats = (clientId: string) => {
    const data = getClientProgress(clientId);
    if (data.length < 2) return null;

    const first = data[0];
    const last = data[data.length - 1];

    return {
      weightChange: last.weight - first.weight,
      bodyFatChange: (last.bodyFat || 0) - (first.bodyFat || 0),
      muscleMassChange: (last.muscleMass || 0) - (first.muscleMass || 0),
      totalEntries: data.length,
      period: {
        start: first.date,
        end: last.date
      }
    };
  };

  return {
    progressData,
    isLoadingProgress: isLoading,
    getClientProgress,
    getLatestProgress,
    addProgress,
    updateProgress,
    deleteProgress,
    getWeightChartData,
    getBodyCompositionChartData,
    getStats
  };
}
