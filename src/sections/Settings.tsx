import { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SettingsProps {
  onClearData: () => void;
}

export function Settings({ onClearData }: SettingsProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [settings, setSettings] = useState({
    gymName: 'AngraFit Academia',
    gymAddress: '',
    gymPhone: '',
    gymEmail: '',
    adminPassword: 'admin'
  });

  const handleExportData = () => {
    const data = {
      clients: JSON.parse(localStorage.getItem('angrafit_clients') || '[]'),
      workouts: JSON.parse(localStorage.getItem('angrafit_workouts') || '[]'),
      diets: JSON.parse(localStorage.getItem('angrafit_diets') || '[]'),
      payments: JSON.parse(localStorage.getItem('angrafit_payments') || '[]'),
      messages: JSON.parse(localStorage.getItem('angrafit_messages') || '[]'),
      schedules: JSON.parse(localStorage.getItem('angrafit_schedules') || '[]'),
      progress: JSON.parse(localStorage.getItem('angrafit_progress') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angrafit_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.clients) localStorage.setItem('angrafit_clients', JSON.stringify(data.clients));
        if (data.workouts) localStorage.setItem('angrafit_workouts', JSON.stringify(data.workouts));
        if (data.diets) localStorage.setItem('angrafit_diets', JSON.stringify(data.diets));
        if (data.payments) localStorage.setItem('angrafit_payments', JSON.stringify(data.payments));
        if (data.messages) localStorage.setItem('angrafit_messages', JSON.stringify(data.messages));
        if (data.schedules) localStorage.setItem('angrafit_schedules', JSON.stringify(data.schedules));
        if (data.progress) localStorage.setItem('angrafit_progress', JSON.stringify(data.progress));
        alert('Dados importados com sucesso! Recarregue a página.');
        window.location.reload();
      } catch (error) {
        alert('Erro ao importar dados. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    onClearData();
    setIsClearDialogOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gym Info */}
        <Card className="bg-[#111118] border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Informações da Academia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Nome da Academia</Label>
              <Input
                value={settings.gymName}
                onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Endereço</Label>
              <Input
                value={settings.gymAddress}
                onChange={(e) => setSettings({ ...settings, gymAddress: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Telefone</Label>
              <Input
                value={settings.gymPhone}
                onChange={(e) => setSettings({ ...settings, gymPhone: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">E-mail</Label>
              <Input
                value={settings.gymEmail}
                onChange={(e) => setSettings({ ...settings, gymEmail: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>
            <Button className="w-full btn-primary-red">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-[#111118] border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Gerenciamento de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-300 mb-2">
                <strong>Backup dos Dados</strong>
              </p>
              <p className="text-xs text-blue-400 mb-3">
                Exporte todos os dados do sistema para um arquivo JSON.
              </p>
              <Button onClick={handleExportData} variant="outline" className="w-full border-blue-500/30 text-blue-400">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-300 mb-2">
                <strong>Importar Dados</strong>
              </p>
              <p className="text-xs text-green-400 mb-3">
                Restaure dados de um arquivo de backup JSON.
              </p>
              <label className="w-full">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button variant="outline" className="w-full border-green-500/30 text-green-400" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Dados
                  </span>
                </Button>
              </label>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300 mb-2">
                <strong>Zona de Perigo</strong>
              </p>
              <p className="text-xs text-red-400 mb-3">
                Esta ação irá apagar TODOS os dados do sistema. Não pode ser desfeita.
              </p>
              <Button 
                onClick={() => setIsClearDialogOpen(true)}
                variant="outline" 
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="bg-[#111118] border-red-500/20">
        <CardHeader>
          <CardTitle className="text-white">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10">
              <p className="text-gray-500 text-sm">Versão</p>
              <p className="text-white font-bold">1.0.0</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10">
              <p className="text-gray-500 text-sm">Armazenamento</p>
              <p className="text-white font-bold">LocalStorage</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10">
              <p className="text-gray-500 text-sm">Modo</p>
              <p className="text-white font-bold">100% Offline</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-red-500/10">
              <p className="text-gray-500 text-sm">Status</p>
              <p className="text-green-400 font-bold">Ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="bg-[#111118] border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl text-center">
              ⚠️ Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">
              Tem certeza que deseja apagar TODOS os dados do sistema?
            </p>
            <p className="text-red-400 text-sm">
              Esta ação não pode ser desfeita!
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsClearDialogOpen(false)}
              className="flex-1 border-red-500/30 text-gray-400"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleClearAllData}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sim, Apagar Tudo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
