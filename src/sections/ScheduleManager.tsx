import { useState } from 'react';
import { 
  Calendar, Plus, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client, Schedule } from '@/types';

interface ScheduleManagerProps {
  clients: Client[];
  schedules: Schedule[];
  onAddSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  onUpdateSchedule: (id: string, updates: Partial<Schedule>) => void;
  onMarkAsCompleted: (id: string) => void;
  onCancelSchedule: (id: string) => void;
}

export function ScheduleManager({ 
  clients, 
  schedules, 
  onAddSchedule, 
  onUpdateSchedule, 
  onMarkAsCompleted,
  onCancelSchedule
}: ScheduleManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    time: '',
    duration: '60',
    type: 'Musculação',
    notes: ''
  });

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSchedulesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleSubmit = () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const scheduleData = {
      clientId: formData.clientId,
      clientName: client.name,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration) || 60,
      type: formData.type,
      status: 'agendado' as const,
      notes: formData.notes
    };

    if (editingSchedule) {
      onUpdateSchedule(editingSchedule.id, scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({ clientId: '', date: '', time: '', duration: '60', type: 'Musculação', notes: '' });
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      clientId: schedule.clientId,
      date: schedule.date,
      time: schedule.time,
      duration: schedule.duration.toString(),
      type: schedule.type,
      notes: schedule.notes
    });
    setIsDialogOpen(true);
  };

  const weekDays = getWeekDays();
  const weekDaysNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Agenda</h1>
          <p className="text-gray-400 mt-1">Gerencie os treinos agendados</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
            className="border-red-500/30 text-gray-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium">
            {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
            className="border-red-500/30 text-gray-400"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button className="btn-primary-red ml-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const daySchedules = getSchedulesForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div key={idx} className="min-h-[200px]">
              <div className={`text-center p-2 rounded-t-xl ${isToday ? 'bg-red-500/20' : 'bg-[#111118]'}`}>
                <p className="text-gray-500 text-xs">{weekDaysNames[idx]}</p>
                <p className={`text-lg font-bold ${isToday ? 'text-red-500' : 'text-white'}`}>
                  {day.getDate()}
                </p>
              </div>
              <div className="bg-[#0a0a0f] border border-red-500/10 rounded-b-xl p-2 space-y-2 min-h-[150px]">
                {daySchedules.map(schedule => (
                  <div 
                    key={schedule.id}
                    className={`p-2 rounded-lg text-xs cursor-pointer transition-all ${
                      schedule.status === 'concluido' 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : schedule.status === 'cancelado'
                        ? 'bg-gray-500/10 border border-gray-500/30'
                        : 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                    }`}
                    onClick={() => handleEdit(schedule)}
                  >
                    <p className="font-medium text-white">{schedule.time}</p>
                    <p className="text-gray-400 truncate">{schedule.clientName}</p>
                    <p className="text-gray-500">{schedule.type}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Schedules */}
      <Card className="bg-[#111118] border-red-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" strokeWidth={1.5} />
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.filter(s => s.status === 'agendado').length > 0 ? (
            <div className="space-y-3">
              {schedules
                .filter(s => s.status === 'agendado')
                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .slice(0, 10)
                .map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-red-400">{new Date(schedule.date).getDate()}</span>
                        <span className="text-xs text-gray-500">{new Date(schedule.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{schedule.clientName}</p>
                        <p className="text-sm text-gray-500">{schedule.time} • {schedule.type} • {schedule.duration}min</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => onMarkAsCompleted(schedule.id)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onCancelSchedule(schedule.id)}
                        className="border-red-500/30 text-red-400"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
              <p className="text-gray-500">Nenhum agendamento próximo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Cliente</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Hora</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Duração (min)</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {['30', '45', '60', '90', '120'].map(d => (
                      <SelectItem key={d} value={d} className="text-white">{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {['Musculação', 'Cardio', 'Funcional', 'Pilates', 'Yoga', 'Avaliação'].map(t => (
                      <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Observações</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-red-500/30 text-gray-400"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 btn-primary-red"
                disabled={!formData.clientId || !formData.date || !formData.time}
              >
                {editingSchedule ? 'Salvar' : 'Agendar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
