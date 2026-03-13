import { useState } from 'react';
import { 
  Apple, Plus, Edit2, Trash2, ChevronDown, ChevronUp, 
  Sparkles, Save, X, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Client, Diet, Meal, Food } from '@/types';
import { MEAL_TYPES, FOOD_DATABASE } from '@/types';

interface DietsManagerProps {
  clients: Client[];
  diets: Diet[];
  onAddDiet: (diet: Omit<Diet, 'id' | 'createdAt'>) => void;
  onUpdateDiet: (id: string, updates: Partial<Diet>) => void;
  onDeleteDiet: (id: string) => void;
  onGenerateAI: (clientId: string, goal: string) => void;
}

export function DietsManager({ 
  clients, 
  diets, 
  onAddDiet, 
  onUpdateDiet, 
  onDeleteDiet,
  onGenerateAI 
}: DietsManagerProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [expandedDiet, setExpandedDiet] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    meals: [] as Meal[]
  });

  const clientDiets = selectedClient 
    ? diets.filter(d => d.clientId === selectedClient)
    : [];

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: `meal_${Date.now()}`,
      name: MEAL_TYPES[0],
      foods: []
    };
    setFormData({
      ...formData,
      meals: [...formData.meals, newMeal]
    });
  };

  const handleAddFood = (mealIndex: number) => {
    const newFood: Food = {
      id: `food_${Date.now()}`,
      name: FOOD_DATABASE[0],
      quantity: '100g',
      observations: ''
    };
    const updated = [...formData.meals];
    updated[mealIndex].foods.push(newFood);
    setFormData({ ...formData, meals: updated });
  };

  const handleUpdateFood = (mealIndex: number, foodIndex: number, field: keyof Food, value: string) => {
    const updated = [...formData.meals];
    updated[mealIndex].foods[foodIndex] = { 
      ...updated[mealIndex].foods[foodIndex], 
      [field]: value 
    };
    setFormData({ ...formData, meals: updated });
  };

  const handleRemoveFood = (mealIndex: number, foodIndex: number) => {
    const updated = [...formData.meals];
    updated[mealIndex].foods = updated[mealIndex].foods.filter((_, i) => i !== foodIndex);
    setFormData({ ...formData, meals: updated });
  };

  const handleRemoveMeal = (mealIndex: number) => {
    setFormData({
      ...formData,
      meals: formData.meals.filter((_, i) => i !== mealIndex)
    });
  };

  const handleSubmit = () => {
    if (!selectedClient) return;

    const dietData = {
      clientId: selectedClient,
      name: formData.name,
      meals: formData.meals
    };

    if (editingDiet) {
      onUpdateDiet(editingDiet.id, dietData);
    } else {
      onAddDiet(dietData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      meals: []
    });
    setEditingDiet(null);
  };

  const handleEdit = (diet: Diet) => {
    setEditingDiet(diet);
    setFormData({
      name: diet.name,
      meals: JSON.parse(JSON.stringify(diet.meals))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta dieta?')) {
      onDeleteDiet(id);
    }
  };

  const handleGenerateAI = () => {
    if (!selectedClient || !selectedClientData) return;
    onGenerateAI(selectedClient, selectedClientData.goal);
    setIsAIDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Dietas</h1>
          <p className="text-gray-400 mt-1">Crie planos alimentares personalizados</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsAIDialogOpen(true)}
            disabled={!selectedClient}
            className="border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Gerar com IA
          </Button>
          <Button 
            className="btn-primary-red"
            onClick={() => setIsDialogOpen(true)}
            disabled={!selectedClient}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Nova Dieta
          </Button>
        </div>
      </div>

      {/* Client Selector */}
      <Card className="bg-[#111118] border-red-500/20">
        <CardContent className="p-4">
          <Label className="text-gray-400 mb-2 block">Selecione o Cliente</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
              <SelectValue placeholder="Selecione um cliente..." />
            </SelectTrigger>
            <SelectContent className="bg-[#111118] border-red-500/30">
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id} className="text-white">
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Diets List */}
      {selectedClient ? (
        clientDiets.length > 0 ? (
          <div className="space-y-4">
            {clientDiets.map((diet) => (
              <Collapsible 
                key={diet.id}
                open={expandedDiet === diet.id}
                onOpenChange={(open) => setExpandedDiet(open ? diet.id : null)}
              >
                <Card className="bg-[#111118] border-red-500/20">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-red-500/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Apple className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{diet.name}</CardTitle>
                            <p className="text-sm text-gray-500">{diet.meals.length} refeições</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleEdit(diet); }}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDelete(diet.id); }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                          {expandedDiet === diet.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {diet.meals.map((meal) => (
                          <div 
                            key={meal.id}
                            className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10"
                          >
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                              {meal.name}
                            </h4>
                            <div className="space-y-2">
                              {meal.foods.map((food) => (
                                <div key={food.id} className="flex items-center gap-3 text-sm">
                                  <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                  <span className="text-white flex-1">{food.name}</span>
                                  <span className="text-gray-500">{food.quantity}</span>
                                  {food.observations && (
                                    <span className="text-gray-600 text-xs">({food.observations})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Apple className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
            <p className="text-gray-500 text-lg">Nenhuma dieta cadastrada</p>
            <p className="text-gray-600 text-sm mt-2">Crie uma nova dieta ou gere com IA</p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
          <p className="text-gray-500 text-lg">Selecione um cliente</p>
          <p className="text-gray-600 text-sm mt-2">Escolha um cliente para ver suas dietas</p>
        </div>
      )}

      {/* New/Edit Diet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingDiet ? 'Editar Dieta' : 'Nova Dieta'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Nome da dieta</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
                placeholder="Ex: Dieta de Hipertrofia"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Refeições</Label>
                <Button onClick={handleAddMeal} variant="outline" size="sm" className="border-red-500/30 text-red-400">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Refeição
                </Button>
              </div>

              <div className="space-y-4">
                {formData.meals.map((meal, mealIdx) => (
                  <div key={meal.id} className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <Select 
                        value={meal.name} 
                        onValueChange={(v) => {
                          const updated = [...formData.meals];
                          updated[mealIdx].name = v;
                          setFormData({ ...formData, meals: updated });
                        }}
                      >
                        <SelectTrigger className="bg-[#111118] border-red-500/30 text-white w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111118] border-red-500/30">
                          {MEAL_TYPES.map(mt => (
                            <SelectItem key={mt} value={mt} className="text-white">{mt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMeal(mealIdx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {meal.foods.map((food, foodIdx) => (
                        <div key={food.id} className="flex items-center gap-2">
                          <Select 
                            value={food.name} 
                            onValueChange={(v) => handleUpdateFood(mealIdx, foodIdx, 'name', v)}
                          >
                            <SelectTrigger className="bg-[#111118] border-red-500/30 text-white flex-1 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111118] border-red-500/30 max-h-48">
                              {FOOD_DATABASE.map(f => (
                                <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={food.quantity}
                            onChange={(e) => handleUpdateFood(mealIdx, foodIdx, 'quantity', e.target.value)}
                            className="bg-[#111118] border-red-500/30 text-white w-24 text-sm"
                            placeholder="Qtd"
                          />
                          <Input
                            value={food.observations}
                            onChange={(e) => handleUpdateFood(mealIdx, foodIdx, 'observations', e.target.value)}
                            className="bg-[#111118] border-red-500/30 text-white w-32 text-sm"
                            placeholder="Obs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveFood(mealIdx, foodIdx)}
                            className="text-red-400 hover:text-red-300 px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddFood(mealIdx)}
                      className="mt-3 border-green-500/30 text-green-400 w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Alimento
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-red-500/30 text-gray-400 hover:text-white hover:bg-red-500/10"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 btn-primary-red"
                disabled={!formData.name || formData.meals.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingDiet ? 'Salvar Alterações' : 'Criar Dieta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Gerar Dieta com IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm text-purple-300">
                <strong>Cliente:</strong> {selectedClientData?.name}
              </p>
              <p className="text-sm text-purple-300">
                <strong>Objetivo:</strong> {selectedClientData?.goal}
              </p>
            </div>

            <p className="text-gray-400 text-sm">
              A IA irá gerar uma dieta completa com 7 refeições baseada no objetivo do cliente.
            </p>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAIDialogOpen(false)}
                className="flex-1 border-red-500/30 text-gray-400"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleGenerateAI}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Dieta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Users } from 'lucide-react';
