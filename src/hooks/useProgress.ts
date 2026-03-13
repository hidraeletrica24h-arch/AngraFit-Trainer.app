import { useLocalStorage } from './useLocalStorage';
import type { Progress } from '@/types';

export function useProgress() {
  const [progressData, setProgressData] = useLocalStorage<Progress[]>('angrafit_progress', []);

  const getClientProgress = (clientId: string): Progress[] => {
    return progressData
      .filter(p => p.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getLatestProgress = (clientId: string): Progress | null => {
    const clientProgress = getClientProgress(clientId);
    return clientProgress.length > 0 ? clientProgress[clientProgress.length - 1] : null;
  };

  const addProgress = (progress: Omit<Progress, 'id'>): Progress => {
    const newProgress: Progress = {
      ...progress,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setProgressData(prev => [...prev, newProgress]);
    return newProgress;
  };

  const updateProgress = (id: string, updates: Partial<Progress>): boolean => {
    setProgressData(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  };

  const deleteProgress = (id: string): boolean => {
    setProgressData(prev => prev.filter(p => p.id !== id));
    return true;
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
