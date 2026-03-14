import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Workout, Exercise } from '@/types';
import { DAYS_OF_WEEK, EXERCISE_DATABASE } from '@/types';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedWorkouts: Workout[] = (data || []).map(w => ({
        id: w.id,
        clientId: w.client_id,
        name: w.name,
        dayOfWeek: w.day_of_week,
        createdAt: w.created_at,
        exercises: w.exercises.map((e: any) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscle_group,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          restTime: e.rest_time
        }))
      }));

      setWorkouts(formattedWorkouts);
    } catch (e) {
      console.error('Erro ao buscar treinos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientWorkouts = (clientId: string): Workout[] => {
    return workouts.filter(w => w.clientId === clientId);
  };

  const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt' | 'exercises'> & { exercises: Omit<Exercise, 'id'>[] }) => {
    try {
      // 1. Inserir Treino
      const { data: woData, error: woError } = await supabase
        .from('workouts')
        .insert([{
          client_id: workout.clientId,
          name: workout.name,
          day_of_week: workout.dayOfWeek
        }])
        .select()
        .single();

      if (woError) throw woError;
      
      const newWorkout: Workout = {
        id: woData.id,
        clientId: workout.clientId,
        name: workout.name,
        dayOfWeek: workout.dayOfWeek,
        createdAt: woData.created_at,
        exercises: []
      };

      // 2. Definir Exercícios Vazios se não enviados
      const exercisesToInsert = workout.exercises || [];

      // 3. Inserir Exercícios se houver
      if (exercisesToInsert.length > 0) {
        const exercisesDb = exercisesToInsert.map(e => ({
          workout_id: woData.id,
          name: e.name,
          muscle_group: e.muscleGroup,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          rest_time: e.restTime
        }));

        const { data: exData, error: exError } = await supabase
          .from('exercises')
          .insert(exercisesDb)
          .select();

        if (exError) throw exError;
        
        if (exData) {
          newWorkout.exercises = exData.map((e: any) => ({
            id: e.id,
            name: e.name,
            muscleGroup: e.muscle_group,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restTime: e.rest_time
          }));
        }
      }

      setWorkouts(prev => [newWorkout, ...prev]);
      return true;
    } catch (e) {
      console.error('Erro ao adicionar treino:', e);
      throw e;
    }
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.dayOfWeek) dbUpdates.day_of_week = updates.dayOfWeek;
      
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('workouts')
          .update(dbUpdates)
          .eq('id', id);

        if (error) throw error;
        setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      }
      return true;
    } catch (e) {
      console.error('Erro ao atualizar treino:', e);
      throw e;
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWorkouts(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao deletar treino:', e);
      throw e;
    }
  };

  const addExercise = async (_workoutId: string, exercise: Omit<Exercise, 'id'>) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .insert([{
          workout_id: _workoutId,
          name: exercise.name,
          muscle_group: exercise.muscleGroup,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest_time: exercise.restTime
        }]);

      if (error) throw error;
      fetchWorkouts();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar exercício:', e);
      throw e;
    }
  };

  const removeExercise = async (_workoutId: string, exerciseId: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;
      fetchWorkouts();
      return true;
    } catch (e) {
      console.error('Erro ao remover exercício:', e);
      throw e;
    }
  };

  const generateAIWorkout = async (clientId: string, goal: string, level: string, daysPerWeek: number, gender: 'masculino' | 'feminino') => {
    setIsLoading(true);
    try {
      // 1. Definir Divisão de Treino (Split) baseada em Gênero e Dias
      const splits: Record<string, Record<number, string[][]>> = {
        masculino: {
          1: [['Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps']],
          2: [['Peito', 'Tríceps', 'Ombro'], ['Costas', 'Bíceps', 'Pernas']],
          3: [['Peito', 'Tríceps'], ['Costas', 'Bíceps'], ['Pernas', 'Ombro']],
          4: [['Peito', 'Ombro'], ['Costas', 'Trapézio'], ['Pernas'], ['Bíceps', 'Tríceps']],
          5: [['Peito'], ['Costas'], ['Pernas'], ['Ombro'], ['Bíceps', 'Tríceps']],
          6: [['Peito'], ['Costas'], ['Pernas'], ['Ombro'], ['Bíceps', 'Tríceps'], ['Pernas', 'Abdômen']]
        },
        feminino: {
          1: [['Pernas', 'Glúteos', 'Peito', 'Costas', 'Ombro', 'Braços']],
          2: [['Membros Inferiores (Foco Glúteo)', 'Cardio'], ['Membros Superiores', 'Abdômen']],
          3: [['Pernas (Foco Quadríceps)', 'Ombro'], ['Costas', 'Bíceps', 'Peito'], ['Pernas (Foco Glúteo/Isquios)']],
          4: [['Quadríceps', 'Panturrilha'], ['Superiores Completo'], ['Glúteos', 'Posterior'], ['Cardio', 'Abdômen']],
          5: [['Quadríceps'], ['Superiores (Costas/Bíceps)'], ['Glúteos'], ['Superiores (Peito/Ombro/Tríceps)'], ['Posterior/Panturrilha']],
          6: [['Quadríceps'], ['Costas/Ombro'], ['Glúteos'], ['Peito/Braços'], ['Posterior'], ['Abdômen/Cardio']]
        }
      };

      const selectedSplit = splits[gender]?.[daysPerWeek] || splits[gender]?.[3] || splits.masculino[3];

      for (let index = 0; index < selectedSplit.length; index++) {
        const groups = selectedSplit[index];
        const exercises: Omit<Exercise, 'id'>[] = [];
        
        groups.forEach(group => {
          // Normalizar grupo para busca no banco (ex: 'Pernas (Foco...)' -> 'Pernas')
          const dbGroup = group.includes('Perna') ? 'Pernas' : 
                         group.includes('Glúteo') ? 'Glúteos' : 
                         group.includes('Superior') ? 'Costas' : group;
          
          const groupExercises = EXERCISE_DATABASE[dbGroup as keyof typeof EXERCISE_DATABASE] || EXERCISE_DATABASE['Pernas'];
          
          // Definir volume (número de exercícios)
          let numExercises = 2;
          if (level === 'intermediario') numExercises = 3;
          if (level === 'avancado') numExercises = 4;

          // Ajuste de volume por gênero (ex: mais perna para mulheres)
          if (gender === 'feminino' && (dbGroup === 'Pernas' || dbGroup === 'Glúteos')) {
            numExercises += 1;
          }

          const selected = groupExercises.sort(() => 0.5 - Math.random()).slice(0, numExercises);
          
          selected.forEach((exName: string) => {
            // Regras de Carga (Pesos) Realistas
            let baseWeight = '5-10';
            if (level === 'intermediario') baseWeight = '15-25';
            if (level === 'avancado') baseWeight = '30-50';

            // Ajuste por tipo de exercício (estimado)
            if (exName.includes('Leg Press') || exName.includes('Agachamento')) {
              baseWeight = level === 'iniciante' ? '20-40' : level === 'intermediario' ? '60-100' : '120-200';
            } else if (exName.includes('Rosca') || exName.includes('Elevação')) {
              baseWeight = level === 'iniciante' ? '3-5' : level === 'intermediario' ? '7-10' : '12-16';
            }

            // Regras de Repetições por Objetivo
            const reps = goal === 'hipertrofia' ? '8-12' : 
                         goal === 'forca' ? '4-6' : 
                         goal === 'emagrecimento' ? '15-20' : '12-15';

            // Regras de Descanso por Objetivo
            const restTime = goal === 'forca' ? 120 : 
                             goal === 'emagrecimento' ? 45 : 60;

            exercises.push({
              name: exName,
              muscleGroup: dbGroup,
              sets: (level === 'avancado' && goal === 'hipertrofia') ? 4 : 3,
              reps,
              weight: baseWeight,
              restTime
            });
          });
        });

        await addWorkout({
          clientId,
          name: `Treino ${String.fromCharCode(65 + index)} - ${groups.join(', ')}`,
          dayOfWeek: DAYS_OF_WEEK[index % DAYS_OF_WEEK.length],
          exercises
        });
      }
      
      return true;
    } catch (e) {
      console.error('Erro no Auto Gen', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workouts,
    isLoadingWorkouts: isLoading,
    getClientWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    removeExercise,
    generateAIWorkout
  };
}
