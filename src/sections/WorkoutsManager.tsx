import { useState } from 'react';
import { 
  Dumbbell, Plus, Edit2, Trash2, 
  Clock, ChevronDown, ChevronUp, Sparkles,
  Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Client, Workout, Exercise } from '@/types';
import { DAYS_OF_WEEK, EXERCISE_DATABASE, MUSCLE_GROUPS } from '@/types';

interface WorkoutsManagerProps {
  clients: Client[];
  workouts: Workout[];
  onAddWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Promise<any>;
  onUpdateWorkout: (id: string, updates: Partial<Workout>) => Promise<any>;
  onDeleteWorkout: (id: string) => Promise<any>;
  onGenerateAI: (clientId: string, goal: string, level: string, days: number, gender: 'masculino' | 'feminino') => Promise<any>;
}

export function WorkoutsManager({ 
  clients, 
  workouts, 
  onAddWorkout, 
  onUpdateWorkout, 
  onDeleteWorkout,
  onGenerateAI 
}: WorkoutsManagerProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    dayOfWeek: 'Segunda-feira',
    exercises: [] as Exercise[]
  });

  const [aiParams, setAiParams] = useState({
    days: 3,
    goal: 'hipertrofia'
  });

  const clientWorkouts = selectedClient 
    ? workouts.filter(w => w.clientId === selectedClient)
    : [];

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: `ex_${Date.now()}`,
      name: '',
      muscleGroup: MUSCLE_GROUPS[0],
      sets: 3,
      reps: '10-12',
      weight: '0',
      restTime: 60
    };
    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise]
    });
  };

  const handleUpdateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...formData.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, exercises: updated });
  };

  const handleRemoveExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!selectedClient) return;

    const workoutData = {
      clientId: selectedClient,
      name: formData.name,
      dayOfWeek: formData.dayOfWeek,
      exercises: formData.exercises
    };

    try {
      if (editingWorkout) {
        await onUpdateWorkout(editingWorkout.id, workoutData);
      } else {
        await onAddWorkout(workoutData);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      alert('Erro ao salvar treino. Verifique a conexão.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dayOfWeek: 'Segunda-feira',
      exercises: []
    });
    setEditingWorkout(null);
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name,
      dayOfWeek: workout.dayOfWeek,
      exercises: [...workout.exercises]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Tentativa de excluir treino ID:", id);
    if (!id) {
      console.error("Erro: ID do treino está undefined!");
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      try {
        console.log("Chamando onDeleteWorkout para ID:", id);
        await onDeleteWorkout(id);
        console.log("onDeleteWorkout executado com sucesso.");
      } catch (error) {
        console.error('Erro ao excluir treino:', error);
        alert('Não foi possível excluir o treino. Tente novamente.');
      }
    }
  };

  const startTimer = (seconds: number) => {
    if (timerInterval) clearInterval(timerInterval);
    setTimer(seconds);
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsTimerRunning(false);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateAI = () => {
    if (!selectedClient || !selectedClientData) return;
    onGenerateAI(selectedClient, aiParams.goal, selectedClientData.level, aiParams.days, selectedClientData.gender || 'masculino');
    setIsAIDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Treinos</h1>
          <p className="text-gray-400 mt-1">Crie e gerencie treinos personalizados</p>
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
            Novo Treino
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

      {/* Timer */}
      {isTimerRunning && (
        <Card className="bg-[#111118] border-red-500/40 pulse-red">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-2">Descanso</p>
            <p className="text-6xl font-bold text-red-500 timer-active font-mono">
              {formatTime(timer)}
            </p>
            <Button 
              variant="outline" 
              onClick={stopTimer}
              className="mt-4 border-red-500/30 text-red-400"
            >
              <X className="w-4 h-4 mr-2" />
              Parar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workouts List */}
      {selectedClient ? (
        clientWorkouts.length > 0 ? (
          <div className="space-y-4">
            {clientWorkouts.map((workout) => (
              <Collapsible 
                key={workout.id}
                open={expandedWorkout === workout.id}
                onOpenChange={(open) => setExpandedWorkout(open ? workout.id : null)}
              >
                <Card className="bg-[#111118] border-red-500/20">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-red-500/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{workout.name}</CardTitle>
                            <p className="text-sm text-gray-500">{workout.dayOfWeek} • {workout.exercises.length} exercícios</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleEdit(workout); }}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation(); 
                              handleDelete(workout.id); 
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                          {expandedWorkout === workout.id ? (
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
                      <div className="space-y-3">
                        {workout.exercises.map((exercise, idx) => (
                          <div 
                            key={exercise.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10"
                          >
                            <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-white font-medium">{exercise.name}</p>
                              <p className="text-sm text-gray-500">
                                {exercise.sets} séries × {exercise.reps} • {exercise.muscleGroup}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{exercise.weight}kg</span>
                              <button
                                onClick={() => startTimer(exercise.restTime)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Clock className="w-4 h-4" strokeWidth={1.5} />
                                {exercise.restTime}s
                              </button>
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
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
            <p className="text-gray-500 text-lg">Nenhum treino cadastrado</p>
            <p className="text-gray-600 text-sm mt-2">Crie um novo treino ou gere com IA</p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
          <p className="text-gray-500 text-lg">Selecione um cliente</p>
          <p className="text-gray-600 text-sm mt-2">Escolha um cliente para ver seus treinos</p>
        </div>
      )}

      {/* New/Edit Workout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingWorkout ? 'Editar Treino' : 'Novo Treino'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Nome do treino</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: Treino A - Peito e Tríceps"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Dia da semana</Label>
                <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day} value={day} className="text-white">{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Exercícios</Label>
                <Button onClick={handleAddExercise} variant="outline" size="sm" className="border-red-500/30 text-red-400">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {formData.exercises.map((exercise, idx) => (
                  <div key={exercise.id} className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Select 
                        value={exercise.muscleGroup} 
                        onValueChange={(v) => handleUpdateExercise(idx, 'muscleGroup', v)}
                      >
                        <SelectTrigger className="bg-[#111118] border-red-500/30 text-white text-sm">
                          <SelectValue placeholder="Grupo muscular" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111118] border-red-500/30">
                          {MUSCLE_GROUPS.map(mg => (
                            <SelectItem key={mg} value={mg} className="text-white">{mg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={exercise.name} 
                        onValueChange={(v) => handleUpdateExercise(idx, 'name', v)}
                      >
                        <SelectTrigger className="bg-[#111118] border-red-500/30 text-white text-sm">
                          <SelectValue placeholder="Exercício" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111118] border-red-500/30 max-h-48">
                          {(EXERCISE_DATABASE[exercise.muscleGroup as keyof typeof EXERCISE_DATABASE] || []).map((ex: string) => (
                            <SelectItem key={ex} value={ex} className="text-white">{ex}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(idx, 'sets', parseInt(e.target.value))}
                        className="bg-[#111118] border-red-500/30 text-white text-sm"
                        placeholder="Séries"
                      />
                      <Input
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                        className="bg-[#111118] border-red-500/30 text-white text-sm"
                        placeholder="Reps"
                      />
                      <Input
                        value={exercise.weight}
                        onChange={(e) => handleUpdateExercise(idx, 'weight', e.target.value)}
                        className="bg-[#111118] border-red-500/30 text-white text-sm"
                        placeholder="Carga (kg)"
                      />
                      <Input
                        type="number"
                        value={exercise.restTime}
                        onChange={(e) => handleUpdateExercise(idx, 'restTime', parseInt(e.target.value))}
                        className="bg-[#111118] border-red-500/30 text-white text-sm"
                        placeholder="Descanso (s)"
                      />
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-red-400 hover:text-red-300 w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remover
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
                disabled={!formData.name || formData.exercises.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingWorkout ? 'Salvar Alterações' : 'Criar Treino'}
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
              Gerar Treino com IA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm text-purple-300">
                <strong>Cliente:</strong> {selectedClientData?.name}
              </p>
              <p className="text-sm text-purple-300">
                <strong>Objetivo:</strong> {selectedClientData?.goal} • <strong>Nível:</strong> {selectedClientData?.level}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Dias de treino por semana</Label>
              <Select value={aiParams.days.toString()} onValueChange={(v) => setAiParams({ ...aiParams, days: parseInt(v) })}>
                <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-red-500/30">
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <SelectItem key={d} value={d.toString()} className="text-white">{d} dias</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Foco do treino</Label>
              <Select value={aiParams.goal} onValueChange={(v) => setAiParams({ ...aiParams, goal: v })}>
                <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-red-500/30">
                  <SelectItem value="hipertrofia" className="text-white">Hipertrofia</SelectItem>
                  <SelectItem value="emagrecimento" className="text-white">Emagrecimento</SelectItem>
                  <SelectItem value="forca" className="text-white">Força</SelectItem>
                  <SelectItem value="resistencia" className="text-white">Resistência</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                Gerar Treino
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Users } from 'lucide-react';
