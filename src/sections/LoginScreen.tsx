import { useState } from 'react';
import { Dumbbell, User, Lock, Users, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client } from '@/types';

interface LoginScreenProps {
  onLoginAdmin: (username: string, password: string) => boolean;
  onLoginClient: (clientId: string, password: string) => boolean;
  clients: Client[];
}

export function LoginScreen({ onLoginAdmin, onLoginClient, clients }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState('admin');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clientPass, setClientPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = () => {
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      const success = onLoginAdmin(adminUser.trim().toLowerCase(), adminPass.trim());
      if (!success) {
        setError('Usuário ou senha incorretos');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleClientLogin = () => {
    setError('');
    if (!selectedClient) {
      setError('Selecione um cliente');
      return;
    }
    if (!clientPass) {
      setError('Digite a senha');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const success = onLoginClient(selectedClient, clientPass);
      if (!success) {
        setError('Senha incorreta');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-[#0a0a0f] to-[#0a0a0f]" />
        
        {/* Linhas pulsantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent pulsing-line opacity-60" />
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent pulsing-line opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-3/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent pulsing-line opacity-30" style={{ animationDelay: '1s' }} />
        </div>

        {/* Círculos decorativos */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-red-500/20 rounded-full pulse-red" />
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-red-500/10 rounded-full" style={{ animationDelay: '0.5s' }} />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-8 pulse-red">
            <Dumbbell className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            AngraFit <span className="text-red-500 glow-red">Trainer</span>
          </h1>
          
          <p className="text-xl text-gray-400 text-center max-w-md mb-12">
            Sistema Profissional de Gerenciamento para Personal Trainers
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 w-full max-w-lg">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-red-500/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-red-500" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-white">{clients.length}</p>
              <p className="text-sm text-gray-500">Clientes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-red-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-500" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-sm text-gray-500">Offline</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-red-500/30 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-red-500" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-white">300+</p>
              <p className="text-sm text-gray-500">Exercícios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 pulse-red">
              <Dumbbell className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white">
              AngraFit <span className="text-red-500">Trainer</span>
            </h1>
          </div>

          <div className="bg-[#111118] border border-red-500/20 rounded-2xl p-8 pulse-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0f] border border-red-500/20 mb-6">
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-gray-400"
                >
                  <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="client"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-gray-400"
                >
                  <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Cliente
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <TabsContent value="admin" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-2 block">Usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" strokeWidth={1.5} />
                      <Input
                        value={adminUser}
                        onChange={(e) => setAdminUser(e.target.value)}
                        className="pl-10 bg-[#0a0a0f] border-red-500/30 text-white placeholder:text-gray-600 focus:border-red-500"
                        placeholder="Digite o usuário"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 mb-2 block">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" strokeWidth={1.5} />
                      <Input
                        type="password"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className="pl-10 bg-[#0a0a0f] border-red-500/30 text-white placeholder:text-gray-600 focus:border-red-500"
                        placeholder="Digite a senha"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                    className="w-full btn-primary-red h-12 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Entrando...
                      </span>
                    ) : (
                      <>
                        Entrar como Admin
                        <ChevronRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Credenciais padrão: admin / 2486
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="client" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-2 block">Selecione seu nome</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111118] border-red-500/30">
                        {clients.map((client) => (
                          <SelectItem 
                            key={client.id} 
                            value={client.id}
                            className="text-white hover:bg-red-500/20 focus:bg-red-500/20"
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-400 mb-2 block">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" strokeWidth={1.5} />
                      <Input
                        type="password"
                        value={clientPass}
                        onChange={(e) => setClientPass(e.target.value)}
                        className="pl-10 bg-[#0a0a0f] border-red-500/30 text-white placeholder:text-gray-600 focus:border-red-500"
                        placeholder="Digite sua senha"
                        onKeyDown={(e) => e.key === 'Enter' && handleClientLogin()}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleClientLogin}
                    disabled={isLoading}
                    className="w-full btn-primary-red h-12 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Entrando...
                      </span>
                    ) : (
                      <>
                        Entrar como Cliente
                        <ChevronRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                      </>
                    )}
                  </Button>

                  {clients.length === 0 && (
                    <p className="text-center text-sm text-yellow-500/80">
                      Nenhum cliente cadastrado. Entre como admin para cadastrar.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Sistema 100% Offline • Dados armazenados localmente
          </p>
        </div>
      </div>
    </div>
  );
}
