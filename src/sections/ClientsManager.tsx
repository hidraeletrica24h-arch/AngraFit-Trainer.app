import { useState } from 'react';
import { 
  Users, Plus, Search, Edit2, 
  TrendingUp, Target, Activity, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Client } from '@/types';

interface ClientsManagerProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => Promise<any>;
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<any>;
  onDeleteClient: (id: string) => Promise<any>;
}

const GOALS = [
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'resistencia', label: 'Resistência' },
  { value: 'condicionamento', label: 'Condicionamento Físico' }
];

const LEVELS = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' }
];

const STATUS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'pendente', label: 'Pendente' }
];

export function ClientsManager({ clients, onAddClient, onUpdateClient, onDeleteClient }: ClientsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: 'hipertrofia',
    level: 'iniciante',
    gender: 'masculino' as Client['gender'],
    plan: '',
    password: '',
    observations: '',
    status: 'ativo' as Client['status']
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    const clientData = {
      name: formData.name,
      age: parseInt(formData.age) || 0,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      goal: formData.goal as Client['goal'],
      level: formData.level as Client['level'],
      gender: formData.gender as Client['gender'],
      plan: formData.plan,
      password: formData.password || '123456',
      observations: formData.observations,
      status: formData.status,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      if (editingClient) {
        await onUpdateClient(editingClient.id, clientData);
      } else {
        await onAddClient(clientData);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique a conexão ou se todos os campos estão corretos.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      height: '',
      weight: '',
      goal: 'hipertrofia',
      level: 'iniciante',
      gender: 'masculino',
      plan: '',
      password: '',
      observations: '',
      status: 'ativo'
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      age: client.age.toString(),
      height: client.height.toString(),
      weight: client.weight.toString(),
      goal: client.goal,
      level: client.level,
      gender: client.gender,
      plan: client.plan,
      password: client.password,
      observations: client.observations,
      status: client.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Deseja excluir este cliente?");
    if (!confirmDelete) return;
    await onDeleteClient(id);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Clientes</h1>
          <p className="text-gray-400 mt-1">Cadastre e gerencie seus alunos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary-red" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111118] border-red-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Nome completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Digite o nome"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Idade</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: 25"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Altura (cm)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: 175"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Peso (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: 70"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Objetivo</Label>
                <Select value={formData.goal} onValueChange={(v) => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {GOALS.map(g => (
                      <SelectItem key={g.value} value={g.value} className="text-white">{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Nível</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {LEVELS.map(l => (
                      <SelectItem key={l.value} value={l.value} className="text-white">{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Gênero</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as Client['gender'] })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    <SelectItem value="masculino" className="text-white">Masculino</SelectItem>
                    <SelectItem value="feminino" className="text-white">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Plano</Label>
                <Input
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: Mensal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Senha de acesso</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Padrão: 123456"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Client['status'] })}>
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {STATUS.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-400">Observações</Label>
                <Input
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Observações sobre o cliente..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
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
              >
                {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" strokeWidth={1.5} />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 bg-[#111118] border-red-500/20 text-white h-12"
          placeholder="Buscar cliente por nome..."
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-[#111118] border-red-500/20 card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.age} anos • {client.weight}kg</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    client.status === 'ativo' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : client.status === 'pendente'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Target className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    {GOALS.find(g => g.value === client.goal)?.label}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Activity className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    {LEVELS.find(l => l.value === client.level)?.label}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    {new Date(client.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingUp className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    {client.plan || 'Sem plano'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(client)}
                    className="flex-1 border-red-500/30 text-gray-400 hover:text-white hover:bg-red-500/10"
                  >
                    <Edit2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("BOTÃO EXCLUIR CLICADO");
                      handleDelete(client.id);
                    }}
                    className="border-red-500 text-red-500"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" strokeWidth={1.5} />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {searchTerm ? 'Tente outro termo de busca' : 'Clique em "Novo Cliente" para começar'}
          </p>
        </div>
      )}
    </div>
  );
}
