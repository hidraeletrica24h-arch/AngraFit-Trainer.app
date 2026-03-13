import { 
  Users, Dumbbell, Apple, DollarSign, 
  Calendar, MessageSquare, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Client, Workout, Diet, Payment, Message, Schedule } from '@/types';

interface AdminDashboardProps {
  clients: Client[];
  workouts: Workout[];
  diets: Diet[];
  payments: Payment[];
  messages: Message[];
  schedules: Schedule[];
  onSectionChange: (section: string) => void;
}

export function AdminDashboard({ 
  clients, 
  workouts, 
  diets, 
  payments, 
  messages, 
  schedules,
  onSectionChange 
}: AdminDashboardProps) {
  const totalRevenue = payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pendente' || p.status === 'atrasado');
  const unreadMessages = messages.filter(m => !m.read).length;

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  const upcomingSchedules = [...schedules]
    .filter(s => s.status === 'agendado' && new Date(`${s.date}T${s.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  const stats = [
    { 
      label: 'Total de Clientes', 
      value: clients.length, 
      icon: Users, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30',
      onClick: () => onSectionChange('clients')
    },
    { 
      label: 'Treinos Criados', 
      value: workouts.length, 
      icon: Dumbbell, 
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30',
      onClick: () => onSectionChange('workouts')
    },
    { 
      label: 'Dietas Criadas', 
      value: diets.length, 
      icon: Apple, 
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30',
      onClick: () => onSectionChange('diets')
    },
    { 
      label: 'Receita Total', 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, 
      icon: DollarSign, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      onClick: () => onSectionChange('payments')
    },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`bg-[#111118] ${stat.borderColor} cursor-pointer card-hover`}
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Recentes */}
        <Card className="bg-[#111118] border-red-500/20">
          <div className="p-6 flex flex-row items-center justify-between pb-4">
            <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
              <Users className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Clientes Recentes
            </h3>
            <button 
              onClick={() => onSectionChange('clients')}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Ver todos
            </button>
          </div>
          <div className="px-6 pb-6">
            {recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0f] border border-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.goal} • {client.level}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.status === 'ativo' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p>Nenhum cliente cadastrado</p>
              </div>
            )}
          </div>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="bg-[#111118] border-red-500/20">
          <div className="p-6 flex flex-row items-center justify-between pb-4">
            <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Próximos Agendamentos
            </h3>
            <button 
              onClick={() => onSectionChange('schedule')}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Ver agenda
            </button>
          </div>
          <div className="px-6 pb-6">
            {upcomingSchedules.length > 0 ? (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0f] border border-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col items-center justify-center">
                      <span className="text-xs text-red-400">
                        {new Date(schedule.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(schedule.date).toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{schedule.clientName}</p>
                      <p className="text-sm text-gray-500">{schedule.time} • {schedule.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p>Nenhum agendamento próximo</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pagamentos Pendentes */}
        <Card className="bg-[#111118] border-red-500/20">
          <div className="p-6 flex flex-row items-center justify-between pb-4">
            <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
              Pagamentos Pendentes
            </h3>
            <button 
              onClick={() => onSectionChange('payments')}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Ver todos
            </button>
          </div>
          <div className="px-6 pb-6">
            {pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.slice(0, 5).map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0f] border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{payment.clientName}</p>
                      <p className="text-sm text-gray-500">Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-yellow-400 font-bold">
                      R$ {payment.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                <p>Nenhum pagamento pendente</p>
              </div>
            )}
          </div>
        </Card>

        {/* Mensagens Não Lidas */}
        <Card className="bg-[#111118] border-red-500/20">
          <div className="p-6 flex flex-row items-center justify-between pb-4">
            <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
              Mensagens
            </h3>
            <button 
              onClick={() => onSectionChange('messages')}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Ver todas
            </button>
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
                </div>
                <p className="text-2xl font-bold text-white">{unreadMessages}</p>
                <p className="text-gray-500">mensagens não lidas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
