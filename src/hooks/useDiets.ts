import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Diet, Meal, Food } from '@/types';
import { MEAL_TYPES } from '@/types';

export function useDiets() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('diets')
        .select(`
          *,
          meals (
            *,
            foods (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDiets: Diet[] = (data || []).map(d => ({
        id: d.id,
        clientId: d.client_id,
        name: d.name,
        createdAt: d.created_at,
        meals: (d.meals || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          foods: (m.foods || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            quantity: f.quantity,
            observations: f.observations
          }))
        }))
      }));

      setDiets(formattedDiets);
    } catch (e) {
      console.error('Erro ao buscar dietas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientDiets = (clientId: string): Diet[] => {
    return diets.filter(d => d.clientId === clientId);
  };

  const addDiet = async (diet: Omit<Diet, 'id' | 'createdAt'>) => {
    try {
      // 1. Inserir Dieta
      const { data: dietData, error: dietError } = await supabase
        .from('diets')
        .insert([{
          client_id: diet.clientId,
          name: diet.name
        }])
        .select()
        .single();

      if (dietError) throw dietError;

      const newDiet: Diet = {
        id: dietData.id,
        clientId: diet.clientId,
        name: diet.name,
        createdAt: dietData.created_at,
        meals: []
      };

      // 2. Inserir refeições e comidas, se houver
      if (diet.meals && diet.meals.length > 0) {
        const mealsWithIds: Meal[] = [];
        for (const meal of diet.meals) {
          const { data: mealData, error: mealError } = await supabase
            .from('meals')
            .insert([{
              diet_id: dietData.id,
              name: meal.name
            }])
            .select()
            .single();

          if (mealError) throw mealError;

          const currentMeal: Meal = {
            id: mealData.id,
            name: mealData.name,
            foods: []
          };

          if (meal.foods && meal.foods.length > 0) {
            const foodsDb = meal.foods.map(f => ({
              meal_id: mealData.id,
              name: f.name,
              quantity: f.quantity,
              observations: f.observations || ""
            }));

            const { data: foodData, error: foodError } = await supabase
              .from('foods')
              .insert(foodsDb)
              .select();

            if (foodError) throw foodError;

            if (foodData) {
              currentMeal.foods = foodData.map((f: any) => ({
                id: f.id,
                name: f.name,
                quantity: f.quantity,
                observations: f.observations
              }));
            }
          }
          mealsWithIds.push(currentMeal);
        }
        newDiet.meals = mealsWithIds;
      }

      setDiets(prev => [newDiet, ...prev]);
      return true;
    } catch (e) {
      console.error('Erro ao adicionar dieta:', e);
      throw e;
    }
  };

  const updateDiet = async (id: string, updates: Partial<Diet>) => {
    try {
      if (updates.name) {
        const { error } = await supabase
          .from('diets')
          .update({ name: updates.name })
          .eq('id', id);

        if (error) throw error;
        setDiets(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      }
      return true;
    } catch (e) {
      console.error('Erro ao atualizar dieta:', e);
      throw e;
    }
  };

  const deleteDiet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDiets(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao deletar dieta:', e);
      throw e;
    }
  };

  const addMeal = async (dietId: string, meal: Omit<Meal, 'id'>) => {
    try {
      const { data: mealData, error } = await supabase
        .from('meals')
        .insert([{
          diet_id: dietId,
          name: meal.name
        }])
        .select()
        .single();

      if (error) throw error;

      if (meal.foods && meal.foods.length > 0) {
        const foodsDb = meal.foods.map(f => ({
          meal_id: mealData.id,
          name: f.name,
          quantity: f.quantity,
          observations: f.observations || ""
        }));

        await supabase.from('foods').insert(foodsDb);
      }

      fetchDiets();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar refeição:', e);
      throw e;
    }
  };

  const addFood = async (_dietId: string, mealId: string, food: Omit<Food, 'id'>) => {
    try {
      const { error } = await supabase
        .from('foods')
        .insert([{
          meal_id: mealId,
          name: food.name,
          quantity: food.quantity,
          observations: food.observations || ""
        }]);

      if (error) throw error;
      fetchDiets();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar alimento:', e);
      throw e;
    }
  };

  const generateAIDiet = async (clientId: string, goal: string, gender: 'masculino' | 'feminino') => {
    setIsLoading(true);
    try {
      // Regras de quantidades baseadas em Gênero e Objetivo
      const quantityRules: Record<string, Record<string, string>> = {
        masculino: {
          hipertrofia: '200g',
          emagrecimento: '120g',
          resistencia: '150g',
          padrao: '150g'
        },
        feminino: {
          hipertrofia: '150g',
          emagrecimento: '80g',
          resistencia: '100g',
          padrao: '100g'
        }
      };

      const getQty = (foodName: string) => {
        const rules = quantityRules[gender] || quantityRules.masculino;
        const base = rules[goal] || rules.padrao;
        if (foodName.includes('Arroz') || foodName.includes('Batata')) return base;
        if (foodName.includes('Frango') || foodName.includes('Peixe')) return gender === 'masculino' ? '150-200g' : '100-150g';
        if (foodName === 'Ovos') return gender === 'masculino' ? '3-4 unidades' : '2 unidades';
        return '1 unidade/porção';
      };

      const meals: Meal[] = MEAL_TYPES.map((mealType, mIdx) => {
        let foods: Food[] = [];
        
        // Seleção mais inteligente de alimentos por tipo de refeição
        if (mealType === 'Café da Manhã') {
          foods = [
            { id: `temp-f-${mIdx}-1`, name: 'Ovos', quantity: getQty('Ovos'), observations: 'Mexidos ou cozidos' },
            { id: `temp-f-${mIdx}-2`, name: 'Pão Integral', quantity: '2 fatias', observations: '' }
          ];
        } else if (mealType === 'Almoço' || mealType === 'Jantar') {
          foods = [
            { id: `temp-f-${mIdx}-1`, name: 'Peito de Frango', quantity: getQty('Frango'), observations: 'Grelhado' },
            { id: `temp-f-${mIdx}-2`, name: 'Arroz Integral', quantity: getQty('Arroz'), observations: '' },
            { id: `temp-f-${mIdx}-3`, name: 'Brócolis', quantity: '100g', observations: 'No vapor' },
            { id: `temp-f-${mIdx}-4`, name: 'Azeite', quantity: '1 colher de sopa', observations: '' }
          ];
        } else {
          foods = [
            { id: `temp-f-${mIdx}-1`, name: 'Banana', quantity: '1 unidade', observations: '' },
            { id: `temp-f-${mIdx}-2`, name: 'Aveia', quantity: '30g', observations: '' }
          ];
        }
        
        return {
          id: `temp-m-${mIdx}`,
          name: mealType,
          foods
        };
      });

      await addDiet({
        clientId,
        name: `Plano Alimentar - ${goal.charAt(0).toUpperCase() + goal.slice(1)}`,
        meals
      });

      return true;
    } catch (e) {
      console.error('Erro ao gerar dieta:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    diets,
    isLoadingDiets: isLoading,
    getClientDiets,
    addDiet,
    updateDiet,
    deleteDiet,
    addMeal,
    addFood,
    generateAIDiet
  };
}
