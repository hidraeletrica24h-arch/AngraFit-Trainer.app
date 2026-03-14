import { useState } from 'react';
import { 
  CreditCard, Plus, DollarSign, CheckCircle, AlertCircle, 
  Clock, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Client, Payment } from '@/types';

interface PaymentsManagerProps {
  clients: Client[];
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => Promise<any>;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<any>;
  onMarkAsPaid: (id: string) => Promise<any>;
  onDeletePayment: (id: string) => Promise<any>;
}

export function PaymentsManager({ 
  clients, 
  payments, 
  onAddPayment, 
  onUpdatePayment, 
  onMarkAsPaid,
  onDeletePayment 
}: PaymentsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    dueDate: '',
    description: '',
    method: 'pix' as 'pix' | 'link' | 'dinheiro' | 'outro',
    pixKey: '',
    paymentLink: ''
  });

  const pendingPayments = payments.filter(p => p.status === 'pendente' || p.status === 'atrasado');
  const paidPayments = payments.filter(p => p.status === 'pago');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const paymentData = {
      clientId: formData.clientId,
      clientName: client.name,
      amount: parseFloat(formData.amount) || 0,
      dueDate: formData.dueDate,
      status: 'pendente' as const,
      description: formData.description,
      method: formData.method,
      pixKey: formData.method === 'pix' ? formData.pixKey : undefined,
      paymentLink: formData.method === 'link' ? formData.paymentLink : undefined
    };

    try {
      if (editingPayment) {
        await onUpdatePayment(editingPayment.id, paymentData);
      } else {
        await onAddPayment(paymentData);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      alert('Erro ao salvar pagamento. Verifique a conexão.');
    }
  };

  const resetForm = () => {
    setFormData({ 
      clientId: '', 
      amount: '', 
      dueDate: '', 
      description: '', 
      method: 'pix', 
      pixKey: '', 
      paymentLink: '' 
    });
    setEditingPayment(null);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      clientId: payment.clientId,
      amount: payment.amount.toString(),
      dueDate: payment.dueDate,
      description: payment.description,
      method: payment.method,
      pixKey: payment.pixKey || '',
      paymentLink: payment.paymentLink || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Tentativa de excluir pagamento ID:", id);
    if (!id) {
      console.error("Erro: ID do pagamento está undefined!");
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        console.log("Chamando onDeletePayment para ID:", id);
        await onDeletePayment(id);
        console.log("onDeletePayment executado com sucesso.");
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
        alert('Não foi possível excluir o pagamento. Verifique a conexão.');
      }
    }
  };

  const renderPaymentCard = (payment: Payment) => (
    <div 
      key={payment.id}
      className={`p-4 rounded-xl border ${
        payment.status === 'pago' 
          ? 'bg-green-500/5 border-green-500/20' 
          : payment.status === 'atrasado'
          ? 'bg-red-500/5 border-red-500/20'
          : payment.status === 'aguardando_confirmacao'
          ? 'bg-blue-500/5 border-blue-500/20 pulse-border'
          : 'bg-yellow-500/5 border-yellow-500/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            payment.status === 'pago' 
              ? 'bg-green-500/10' 
              : payment.status === 'atrasado'
              ? 'bg-red-500/10'
              : payment.status === 'aguardando_confirmacao'
              ? 'bg-blue-500/10'
              : 'bg-yellow-500/10'
          }`}>
            {payment.status === 'pago' ? (
              <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
            ) : payment.status === 'atrasado' ? (
              <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
            ) : payment.status === 'aguardando_confirmacao' ? (
              <Clock className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <p className="text-white font-medium">{payment.clientName}</p>
            <p className="text-sm text-gray-500">{payment.description}</p>
            <p className="text-xs text-gray-600">
              Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${
            payment.status === 'pago' ? 'text-green-400' : 'text-white'
          }`}>
            R$ {payment.amount.toFixed(2)}
          </p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            payment.status === 'pago' 
              ? 'bg-green-500/20 text-green-400' 
              : payment.status === 'atrasado'
              ? 'bg-red-500/20 text-red-400'
              : payment.status === 'aguardando_confirmacao'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {payment.status === 'pago' 
              ? 'Pago' 
              : payment.status === 'atrasado' 
              ? 'Atrasado' 
              : payment.status === 'aguardando_confirmacao'
              ? 'Aguardando Confirmação'
              : 'Pendente'}
          </span>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
            {payment.method === 'pix' ? 'PIX' : payment.method === 'link' ? 'Link Pagamento' : payment.method}
          </p>
        </div>
      </div>
      {payment.status !== 'pago' && (
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm"
            onClick={() => onMarkAsPaid(payment.id)}
            className={`flex-1 ${
              payment.status === 'aguardando_confirmacao'
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            } border ${
              payment.status === 'aguardando_confirmacao' 
                ? 'border-blue-500/30' 
                : 'border-green-500/30'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {payment.status === 'aguardando_confirmacao' ? 'Confirmar Recebimento' : 'Marcar como Pago'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEdit(payment)}
            className="text-gray-400"
          >
            Editar
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              handleDelete(payment.id); 
            }}
            className="text-red-400"
          >
            Excluir
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
          <p className="text-gray-400 mt-1">Controle de mensalidades e receitas</p>
        </div>
        <Button className="btn-primary-red" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Novo Pagamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111118] border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendente</p>
                <p className="text-2xl font-bold text-yellow-400">R$ {pendingAmount.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Pagamentos</p>
                <p className="text-2xl font-bold text-white">{payments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-[#111118] border border-red-500/20">
          <TabsTrigger value="pending" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Pendentes ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Pagos ({paidPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4">
              {pendingPayments.length > 0 ? (
                <div className="space-y-3">
                  {pendingPayments.map(renderPaymentCard)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
                  <p className="text-gray-500">Nenhum pagamento pendente!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          <Card className="bg-[#111118] border-red-500/20">
            <CardContent className="p-4">
              {paidPayments.length > 0 ? (
                <div className="space-y-3">
                  {paidPayments.map(renderPaymentCard)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
                  <p className="text-gray-500">Nenhum pagamento recebido ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
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

            <div className="space-y-2">
              <Label className="text-gray-400">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Método de Pagamento</Label>
              <Select value={formData.method} onValueChange={(v: any) => setFormData({ ...formData, method: v })}>
                <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                  <SelectValue placeholder="Selecione o método..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-red-500/30">
                  <SelectItem value="pix" className="text-white">PIX</SelectItem>
                  <SelectItem value="link" className="text-white">Link de Pagamento</SelectItem>
                  <SelectItem value="dinheiro" className="text-white">Dinheiro</SelectItem>
                  <SelectItem value="outro" className="text-white">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
                placeholder="Ex: Mensalidade Janeiro"
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
                disabled={!formData.clientId || !formData.amount || !formData.dueDate}
              >
                {editingPayment ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
