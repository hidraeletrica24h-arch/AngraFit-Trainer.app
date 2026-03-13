import { useLocalStorage } from './useLocalStorage';
import type { Diet, Meal, Food } from '@/types';
import { MEAL_TYPES, FOOD_DATABASE } from '@/types';

export function useDiets() {
  const [diets, setDiets] = useLocalStorage<Diet[]>('angrafit_diets', []);

  const getClientDiets = (clientId: string): Diet[] => {
    return diets.filter(d => d.clientId === clientId);
  };

  const addDiet = (diet: Omit<Diet, 'id' | 'createdAt'>): Diet => {
    const newDiet: Diet = {
      ...diet,
      id: `diet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setDiets(prev => [...prev, newDiet]);
    return newDiet;
  };

  const updateDiet = (id: string, updates: Partial<Diet>): boolean => {
    setDiets(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    return true;
  };

  const deleteDiet = (id: string): boolean => {
    setDiets(prev => prev.filter(d => d.id !== id));
    return true;
  };

  const addMeal = (dietId: string, meal: Omit<Meal, 'id'>): boolean => {
    setDiets(prev => prev.map(d => {
      if (d.id === dietId) {
        return {
          ...d,
          meals: [...d.meals, { ...meal, id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
        };
      }
      return d;
    }));
    return true;
  };

  const addFood = (dietId: string, mealId: string, food: Omit<Food, 'id'>): boolean => {
    setDiets(prev => prev.map(d => {
      if (d.id === dietId) {
        return {
          ...d,
          meals: d.meals.map(m => {
            if (m.id === mealId) {
              return {
                ...m,
                foods: [...m.foods, { ...food, id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
              };
            }
            return m;
          })
        };
      }
      return d;
    }));
    return true;
  };

  const generateAIDiet = (clientId: string, goal: string): Diet => {
    const meals: Meal[] = MEAL_TYPES.map((mealType) => {
      const numFoods = mealType === 'Almoço' || mealType === 'Jantar' ? 4 : 2;
      const foods: Food[] = [];
      
      for (let i = 0; i < numFoods; i++) {
        const randomFood = FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];
        foods.push({
          id: `food_${Date.now()}_${i}`,
          name: randomFood,
          quantity: goal === 'emagrecimento' ? '100g' : '150g',
          observations: ''
        });
      }
      
      return {
        id: `meal_${Date.now()}_${mealType}`,
        name: mealType,
        foods
      };
    });

    const diet: Diet = {
      id: `diet_${Date.now()}`,
      clientId,
      name: `Dieta ${goal === 'hipertrofia' ? 'Hipertrofia' : goal === 'emagrecimento' ? 'Emagrecimento' : 'Equilibrada'}`,
      meals,
      createdAt: new Date().toISOString()
    };

    setDiets(prev => [...prev, diet]);
    return diet;
  };

  return {
    diets,
    getClientDiets,
    addDiet,
    updateDiet,
    deleteDiet,
    addMeal,
    addFood,
    generateAIDiet
  };
}
