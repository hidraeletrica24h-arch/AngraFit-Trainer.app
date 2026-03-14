import { useState } from 'react';
import { 
  MessageSquare, Send, Bell, CheckCheck, Trash2, 
  AlertCircle, Info, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client, Message } from '@/types';

interface MessagesManagerProps {
  clients: Client[];
  messages: Message[];
  onAddMessage: (message: Omit<Message, 'id' | 'date' | 'read'>) => Promise<any>;
  onMarkAsRead: (id: string) => Promise<any>;
  onMarkAllAsRead: (clientId: string) => Promise<any>;
  onDeleteMessage: (id: string) => Promise<any>;
}

const MESSAGE_TYPES = [
  { value: 'aviso', label: 'Aviso', icon: AlertCircle, color: 'text-yellow-400' },
  { value: 'instrucao', label: 'Instrução', icon: Info, color: 'text-blue-400' },
  { value: 'lembrete', label: 'Lembrete', icon: Bell, color: 'text-purple-400' },
  { value: 'motivacional', label: 'Motivacional', icon: Heart, color: 'text-red-400' }
];

export function MessagesManager({ 
  clients, 
  messages, 
  onAddMessage, 
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteMessage 
}: MessagesManagerProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'aviso' as Message['type']
  });

  const clientMessages = selectedClient 
    ? messages.filter(m => m.clientId === selectedClient).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const unreadCount = clientMessages.filter(m => !m.read).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !formData.title || !formData.content) return;

    try {
      await onAddMessage({
        clientId: selectedClient,
        title: formData.title,
        content: formData.content,
        type: formData.type
      });
      setFormData({ title: '', content: '', type: 'aviso' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique a conexão.');
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Tentativa de excluir mensagem ID:", id);
    if (!id) {
      console.error("Erro: ID da mensagem está undefined!");
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      try {
        console.log("Chamando onDeleteMessage para ID:", id);
        await onDeleteMessage(id);
        console.log("onDeleteMessage executado com sucesso.");
      } catch (error) {
        console.error('Erro ao excluir mensagem:', error);
        alert('Não foi possível excluir a mensagem. Verifique a conexão.');
      }
    }
  };

  const getTypeIcon = (type: Message['type']) => {
    const typeConfig = MESSAGE_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || Info;
    return <Icon className={`w-5 h-5 ${typeConfig?.color}`} strokeWidth={1.5} />;
  };

  const getTypeLabel = (type: Message['type']) => {
    return MESSAGE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Mensagens</h1>
        <p className="text-gray-400 mt-1">Envie mensagens e avisos para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Message Form */}
        <Card className="bg-[#111118] border-red-500/20 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Enviar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-400">Destinatário</Label>
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
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Tipo de mensagem</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as Message['type'] })}
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-red-500/30">
                    {MESSAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        <span className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} strokeWidth={1.5} />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white"
                  placeholder="Ex: Lembrete de treino"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Mensagem</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-[#0a0a0f] border-red-500/30 text-white min-h-[120px]"
                  placeholder="Digite sua mensagem..."
                />
              </div>

              <Button 
                type="submit"
                className="w-full btn-primary-red"
                disabled={!selectedClient || !formData.title || !formData.content}
              >
                <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="bg-[#111118] border-red-500/20 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Mensagens Enviadas
              {selectedClient && unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount} não lidas
                </span>
              )}
            </CardTitle>
            {selectedClient && unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onMarkAllAsRead(selectedClient)}
                className="border-red-500/30 text-red-400"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              clientMessages.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {clientMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 rounded-xl border transition-all ${
                        message.read 
                          ? 'bg-[#0a0a0f] border-red-500/10' 
                          : 'bg-red-500/5 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(message.type)}
                          <div>
                            <h4 className={`font-medium ${message.read ? 'text-gray-400' : 'text-white'}`}>
                              {message.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {getTypeLabel(message.type)} • {new Date(message.date).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!message.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onMarkAsRead(message.id)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation(); 
                              handleDelete(message.id); 
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className={`mt-3 text-sm ${message.read ? 'text-gray-500' : 'text-gray-300'}`}>
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
                  <p className="text-gray-500">Nenhuma mensagem enviada</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
                <p className="text-gray-500">Selecione um cliente para ver as mensagens</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Users } from 'lucide-react';
