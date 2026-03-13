import { useState } from 'react';
import { 
  Dumbbell, Apple, Calendar, MessageSquare, TrendingUp,
  LogOut, User, Bell, CheckCircle, Clock, ChevronDown, ChevronUp,
  DollarSign, QrCode, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Client, Workout, Diet, Message, Schedule, Progress, Payment } from '@/types';

interface ClientDashboardProps {
  client: Client;
  workouts: Workout[];
  diets: Diet[];
  messages: Message[];
  schedules: Schedule[];
  progress: Progress[];
  onLogout: () => void;
  onMarkMessageAsRead: (id: string) => void;
  payments: Payment[];
  onRequestPaymentConfirmation: (id: string) => void;
}

export function ClientDashboard({ 
  client, 
  workouts, 
  diets, 
  messages, 
  schedules, 
  payments,
  onLogout,
  onMarkMessageAsRead,
  onRequestPaymentConfirmation
}: ClientDashboardProps) {
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const unreadMessages = messages.filter(m => !m.read);

  const startTimer = (seconds: number) => {
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const upcomingSchedules = schedules
    .filter(s => s.status === 'agendado' && new Date(`${s.date}T${s.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-[#111118] border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center pulse-red">
                <Dumbbell className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AngraFit <span className="text-red-500">Trainer</span></h1>
                <p className="text-sm text-gray-500">Área do Aluno</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">{client.goal} • {client.level}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Timer */}
        {isTimerRunning && (
          <Card className="bg-[#111118] border-red-500/40 pulse-red mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400 mb-2">Descanso</p>
              <p className="text-6xl font-bold text-red-500 timer-active font-mono">
                {formatTime(timer)}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsTimerRunning(false)}
                className="mt-4 border-red-500/30 text-red-400"
              >
                Parar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4 text-center">
              <User className="w-6 h-6 mx-auto mb-2 text-red-500" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white">{client.weight}kg</p>
              <p className="text-xs text-gray-500">Peso Atual</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white">{client.height}cm</p>
              <p className="text-xs text-gray-500">Altura</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4 text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-2 text-blue-500" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white">{workouts.length}</p>
              <p className="text-xs text-gray-500">Treinos</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4 text-center">
              <Bell className="w-6 h-6 mx-auto mb-2 text-yellow-500" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white">{unreadMessages.length}</p>
              <p className="text-xs text-gray-500">Mensagens</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="bg-[#111118] border border-red-500/20 w-full justify-start mb-6">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Dumbbell className="w-4 h-4 mr-2" />
              Treinos
            </TabsTrigger>
            <TabsTrigger value="diets" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Apple className="w-4 h-4 mr-2" />
              Dieta
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="mt-0">
            {workouts.length > 0 ? (
              <div className="space-y-4">
                {workouts.map((workout) => (
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
                            {expandedWorkout === workout.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                            )}
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
                <p className="text-gray-500 text-lg">Nenhum treino atribuído</p>
                <p className="text-gray-600 text-sm mt-2">Aguarde seu personal trainer</p>
              </div>
            )}
          </TabsContent>

          {/* Diets Tab */}
          <TabsContent value="diets" className="mt-0">
            {diets.length > 0 ? (
              <div className="space-y-4">
                {diets.map((diet) => (
                  <Card key={diet.id} className="bg-[#111118] border-green-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Apple className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                        {diet.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {diet.meals.map((meal) => (
                          <div key={meal.id} className="p-4 rounded-xl bg-[#0a0a0f] border border-green-500/10">
                            <h4 className="text-white font-medium mb-3">{meal.name}</h4>
                            <div className="space-y-2">
                              {meal.foods.map((food) => (
                                <div key={food.id} className="flex items-center gap-3 text-sm">
                                  <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                  <span className="text-white flex-1">{food.name}</span>
                                  <span className="text-gray-500">{food.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Apple className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
                <p className="text-gray-500 text-lg">Nenhuma dieta atribuída</p>
                <p className="text-gray-600 text-sm mt-2">Aguarde seu personal trainer</p>
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-0">
            {upcomingSchedules.length > 0 ? (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#111118] border border-blue-500/20">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center">
                      <span className="text-xs text-blue-400">{new Date(schedule.date).getDate()}</span>
                      <span className="text-xs text-gray-500">{new Date(schedule.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{schedule.type}</p>
                      <p className="text-sm text-gray-500">{schedule.time} • {schedule.duration}min</p>
                    </div>
                    <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      Agendado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
                <p className="text-gray-500 text-lg">Nenhum agendamento</p>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-0">
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-4 rounded-xl border ${
                      message.read 
                        ? 'bg-[#111118] border-red-500/10' 
                        : 'bg-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${message.read ? 'text-gray-400' : 'text-white'}`}>
                          {message.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(message.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {!message.read && (
                        <Button 
                          size="sm"
                          onClick={() => onMarkMessageAsRead(message.id)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                    <p className={`mt-3 text-sm ${message.read ? 'text-gray-500' : 'text-gray-300'}`}>
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
                <p className="text-gray-500 text-lg">Nenhuma mensagem</p>
              </div>
            )}
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="mt-0">
            {payments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payments.map((payment) => (
                  <Card 
                    key={payment.id} 
                    className={`bg-[#111118] border ${
                      payment.status === 'pago' 
                        ? 'border-green-500/20' 
                        : payment.status === 'atrasado'
                        ? 'border-red-500/20'
                        : payment.status === 'aguardando_confirmacao'
                        ? 'border-blue-500/20 pulse-border'
                        : 'border-yellow-500/20'
                    }`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          payment.status === 'pago' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                        }`}>
                          <DollarSign className={`w-5 h-5 ${
                            payment.status === 'pago' ? 'text-green-500' : 'text-yellow-500'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">R$ {payment.amount.toFixed(2)}</CardTitle>
                          <p className="text-xs text-gray-500">{payment.description}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full ${
                        payment.status === 'pago' 
                          ? 'bg-green-500/20 text-green-400' 
                          : payment.status === 'atrasado'
                          ? 'bg-red-500/20 text-red-400'
                          : payment.status === 'aguardando_confirmacao'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {payment.status === 'pago' 
                          ? 'Pago' 
                          : payment.status === 'atrasado' 
                          ? 'Atrasado' 
                          : payment.status === 'aguardando_confirmacao'
                          ? 'Confirmando...'
                          : 'Pendente'}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Vencimento</span>
                          <span className="text-white">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {(payment.status === 'pendente' || payment.status === 'atrasado') && (
                          <div className="pt-2 flex flex-col gap-2">
                            {payment.method === 'pix' && (
                              <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                  <QrCode className="w-3 h-3 text-red-500" /> Chave PIX:
                                </p>
                                <p className="text-sm font-mono text-white break-all">{payment.pixKey}</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full mt-2 text-[10px] text-red-400"
                                  onClick={() => {
                                    navigator.clipboard.writeText(payment.pixKey || '');
                                    alert('Chave Pix copiada!');
                                  }}
                                >
                                  Copiar Chave
                                </Button>
                              </div>
                            )}
                            
                            {payment.method === 'link' && (
                              <Button 
                                className="w-full bg-red-500 hover:bg-red-600 text-white gap-2"
                                onClick={() => window.open(payment.paymentLink, '_blank')}
                              >
                                <LinkIcon className="w-4 h-4" />
                                Abrir Link de Pagamento
                              </Button>
                            )}

                            <Button 
                              variant="outline"
                              className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => onRequestPaymentConfirmation(payment.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Já realizei o Pagamento
                            </Button>
                          </div>
                        )}
                        
                        {payment.status === 'aguardando_confirmacao' && (
                          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 text-center">
                            <p className="text-sm text-blue-400">Aguardando confirmação do administrador</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
                <p className="text-gray-500 text-lg">Sem histórico financeiro</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
