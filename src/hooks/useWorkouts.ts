import { useLocalStorage } from './useLocalStorage';
import type { Workout, Exercise } from '@/types';
import { DAYS_OF_WEEK, EXERCISE_DATABASE } from '@/types';

export function useWorkouts() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('angrafit_workouts', []);

  const getClientWorkouts = (clientId: string): Workout[] => {
    return workouts.filter(w => w.clientId === clientId);
  };

  const addWorkout = (workout: Omit<Workout, 'id' | 'createdAt'>): Workout => {
    const newWorkout: Workout = {
      ...workout,
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  };

  const updateWorkout = (id: string, updates: Partial<Workout>): boolean => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    return true;
  };

  const deleteWorkout = (id: string): boolean => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    return true;
  };

  const addExercise = (workoutId: string, exercise: Omit<Exercise, 'id'>): boolean => {
    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: [...w.exercises, { ...exercise, id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
        };
      }
      return w;
    }));
    return true;
  };

  const removeExercise = (workoutId: string, exerciseId: string): boolean => {
    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: w.exercises.filter(e => e.id !== exerciseId)
        };
      }
      return w;
    }));
    return true;
  };

  const generateAIWorkout = (clientId: string, goal: string, level: string, daysPerWeek: number): Workout[] => {
    const generatedWorkouts: Workout[] = [];

    const splits: Record<number, string[][]> = {
      1: [['Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps']],
      2: [['Peito', 'Tríceps', 'Ombro'], ['Costas', 'Bíceps', 'Pernas']],
      3: [['Peito', 'Tríceps'], ['Costas', 'Bíceps'], ['Pernas', 'Ombro']],
      4: [['Peito', 'Tríceps'], ['Costas', 'Bíceps'], ['Pernas'], ['Ombro', 'Abdômen']],
      5: [['Peito'], ['Costas'], ['Pernas'], ['Ombro'], ['Bíceps', 'Tríceps', 'Abdômen']],
      6: [['Peito'], ['Costas'], ['Pernas'], ['Ombro'], ['Bíceps', 'Tríceps'], ['Pernas', 'Abdômen']]
    };

    const selectedSplit = splits[daysPerWeek] || splits[3];

    selectedSplit.forEach((groups, index) => {
      const exercises: Exercise[] = [];
      groups.forEach(group => {
        const groupExercises = EXERCISE_DATABASE[group as keyof typeof EXERCISE_DATABASE] || [];
        const numExercises = level === 'iniciante' ? 2 : level === 'intermediario' ? 3 : 4;
        const selected = groupExercises.slice(0, numExercises);
        
        selected.forEach((exName: string) => {
          exercises.push({
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: exName,
            muscleGroup: group,
            sets: level === 'iniciante' ? 3 : 4,
            reps: goal === 'hipertrofia' ? '8-12' : goal === 'emagrecimento' ? '12-15' : '10-12',
            weight: '0',
            restTime: 60
          });
        });
      });

      const workout: Workout = {
        id: `workout_${Date.now()}_${index}`,
        clientId,
        name: `Treino ${String.fromCharCode(65 + index)} - ${groups.join(', ')}`,
        dayOfWeek: DAYS_OF_WEEK[index % DAYS_OF_WEEK.length],
        exercises,
        createdAt: new Date().toISOString()
      };

      generatedWorkouts.push(workout);
    });

    setWorkouts(prev => [...prev, ...generatedWorkouts]);
    return generatedWorkouts;
  };

  return {
    workouts,
    getClientWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExercise,
    removeExercise,
    generateAIWorkout
  };
}
