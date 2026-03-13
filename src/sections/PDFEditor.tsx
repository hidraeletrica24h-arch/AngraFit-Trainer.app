import { useState } from 'react';
import { FileText, Download, Eye, Dumbbell, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Client, Workout, Diet } from '@/types';

interface PDFEditorProps {
  clients: Client[];
  workouts: Workout[];
  diets: Diet[];
}

export function PDFEditor({ clients, workouts, diets }: PDFEditorProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [selectedDiet, setSelectedDiet] = useState<string>('');
  const [pdfSettings, setPdfSettings] = useState({
    gymName: 'AngraFit Academia',
    gymLogo: '',
    header: '',
    footer: 'AngraFit Trainer - Sistema de Gerenciamento',
    includePhoto: true,
    includeStats: true,
    includeObservations: true
  });

  const clientWorkouts = selectedClient ? workouts.filter(w => w.clientId === selectedClient) : [];
  const clientDiets = selectedClient ? diets.filter(d => d.clientId === selectedClient) : [];
  const selectedClientData = clients.find(c => c.id === selectedClient);

  const generatePDF = () => {
    const content = `
========================================
${pdfSettings.gymName}
========================================

FICHA DO ALUNO
----------------------------------------
Nome: ${selectedClientData?.name || 'N/A'}
Idade: ${selectedClientData?.age || 'N/A'} anos
Peso: ${selectedClientData?.weight || 'N/A'} kg
Altura: ${selectedClientData?.height || 'N/A'} cm
Objetivo: ${selectedClientData?.goal || 'N/A'}
Nível: ${selectedClientData?.level || 'N/A'}

${pdfSettings.header}

${selectedWorkout ? 'TREINO:' : ''}
${selectedWorkout ? clientWorkouts.find(w => w.id === selectedWorkout)?.name : ''}
${selectedWorkout ? '----------------------------------------' : ''}
${selectedWorkout ? clientWorkouts.find(w => w.id === selectedWorkout)?.exercises.map(e => 
  `- ${e.name}: ${e.sets} séries x ${e.reps} reps`
).join('\n') : ''}

${selectedDiet ? 'DIETA:' : ''}
${selectedDiet ? clientDiets.find(d => d.id === selectedDiet)?.name : ''}
${selectedDiet ? '----------------------------------------' : ''}
${selectedDiet ? clientDiets.find(d => d.id === selectedDiet)?.meals.map(m => 
  `\n${m.name}:\n${m.foods.map(f => `- ${f.name}: ${f.quantity}`).join('\n')}`
).join('\n') : ''}

${selectedClientData?.observations ? 'OBSERVAÇÕES:' : ''}
${selectedClientData?.observations || ''}

----------------------------------------
${pdfSettings.footer}
========================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha_${selectedClientData?.name?.replace(/\s+/g, '_') || 'aluno'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Editor de PDF</h1>
        <p className="text-gray-400 mt-1">Gere fichas em PDF para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <Card className="bg-[#111118] border-red-500/20 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Configurações do PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Nome da Academia</Label>
              <Input
                value={pdfSettings.gymName}
                onChange={(e) => setPdfSettings({ ...pdfSettings, gymName: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Cabeçalho</Label>
              <Textarea
                value={pdfSettings.header}
                onChange={(e) => setPdfSettings({ ...pdfSettings, header: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white min-h-[80px]"
                placeholder="Texto do cabeçalho..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Rodapé</Label>
              <Input
                value={pdfSettings.footer}
                onChange={(e) => setPdfSettings({ ...pdfSettings, footer: e.target.value })}
                className="bg-[#0a0a0f] border-red-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Selection */}
        <Card className="bg-[#111118] border-red-500/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              Conteúdo do PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Cliente</Label>
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

            {selectedClient && (
              <Tabs defaultValue="workout" className="w-full">
                <TabsList className="bg-[#0a0a0f] border border-red-500/20">
                  <TabsTrigger value="workout" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Treino
                  </TabsTrigger>
                  <TabsTrigger value="diet" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    <Apple className="w-4 h-4 mr-2" />
                    Dieta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="workout" className="mt-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Selecionar Treino</Label>
                    <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                      <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                        <SelectValue placeholder="Selecione um treino..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111118] border-red-500/30">
                        {clientWorkouts.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id} className="text-white">
                            {workout.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="diet" className="mt-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Selecionar Dieta</Label>
                    <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                      <SelectTrigger className="bg-[#0a0a0f] border-red-500/30 text-white">
                        <SelectValue placeholder="Selecione uma dieta..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111118] border-red-500/30">
                        {clientDiets.map((diet) => (
                          <SelectItem key={diet.id} value={diet.id} className="text-white">
                            {diet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <Button 
              onClick={generatePDF}
              className="w-full btn-primary-red mt-4"
              disabled={!selectedClient}
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar e Baixar PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {selectedClient && (
        <Card className="bg-[#111118] border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white">Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white text-black p-8 rounded-xl font-mono text-sm whitespace-pre-wrap">
              {`========================================
${pdfSettings.gymName}
========================================

FICHA DO ALUNO
----------------------------------------
Nome: ${selectedClientData?.name || 'N/A'}
Idade: ${selectedClientData?.age || 'N/A'} anos
Peso: ${selectedClientData?.weight || 'N/A'} kg
Altura: ${selectedClientData?.height || 'N/A'} cm
Objetivo: ${selectedClientData?.goal || 'N/A'}
Nível: ${selectedClientData?.level || 'N/A'}

${pdfSettings.header}

${selectedWorkout ? `TREINO: ${clientWorkouts.find(w => w.id === selectedWorkout)?.name}` : ''}
${selectedDiet ? `DIETA: ${clientDiets.find(d => d.id === selectedDiet)?.name}` : ''}

${selectedClientData?.observations ? `OBSERVAÇÕES:\n${selectedClientData.observations}` : ''}

----------------------------------------
${pdfSettings.footer}
========================================`}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
