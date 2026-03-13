import { useState } from 'react';
import { LoginScreen } from './sections/LoginScreen';
import { AdminSidebar } from './sections/AdminSidebar';
import { AdminDashboard } from './sections/AdminDashboard';
import { ClientsManager } from './sections/ClientsManager';
import { WorkoutsManager } from './sections/WorkoutsManager';
import { DietsManager } from './sections/DietsManager';
import { MessagesManager } from './sections/MessagesManager';
import { PaymentsManager } from './sections/PaymentsManager';
import { ScheduleManager } from './sections/ScheduleManager';
import { PDFEditor } from './sections/PDFEditor';
import { Settings } from './sections/Settings';
import { ClientDashboard } from './sections/ClientDashboard';
import { MusicPlayer } from './sections/MusicPlayer';
import { useAuth, useWorkouts, useDiets, usePayments, useMessages, useSchedule, useProgress } from './hooks';
import type { Client } from './types';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);

  const { 
    isAuthenticated, 
    isAdmin, 
    isClient, 
    loginAdmin, 
    loginClient, 
    logout, 
    getCurrentClient,
    clients,
    setClients
  } = useAuth();

  const { 
    workouts, 
    getClientWorkouts, 
    addWorkout, 
    updateWorkout, 
    deleteWorkout, 
    generateAIWorkout 
  } = useWorkouts();

  const { 
    diets, 
    getClientDiets, 
    addDiet, 
    updateDiet, 
    deleteDiet, 
    generateAIDiet 
  } = useDiets();

  const { 
    payments, 
    getClientPayments,
    getPendingPayments, 
    addPayment, 
    updatePayment, 
    markAsPaid, 
    requestConfirmation,
    confirmPayment,
    deletePayment 
  } = usePayments();

  const { 
    messages, 
    getClientMessages, 
    addMessage, 
    markAsRead, 
    markAllAsRead, 
    deleteMessage 
  } = useMessages();

  const { 
    schedules, 
    getClientSchedules, 
    addSchedule, 
    updateSchedule, 
    markAsCompleted, 
    cancelSchedule
  } = useSchedule();

  const { 
    getClientProgress
  } = useProgress();

  const handleAddClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (id: string, updates: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleClearAllData = () => {
    localStorage.clear();
  };

  // Client area
  if (isAuthenticated && isClient) {
    const currentClient = getCurrentClient();
    if (!currentClient) {
      logout();
      return null;
    }

    return (
      <>
        <ClientDashboard
          client={currentClient}
          workouts={getClientWorkouts(currentClient.id)}
          diets={getClientDiets(currentClient.id)}
          messages={getClientMessages(currentClient.id)}
          schedules={getClientSchedules(currentClient.id)}
          progress={getClientProgress(currentClient.id)}
          onLogout={logout}
          onMarkMessageAsRead={markAsRead}
          payments={getClientPayments(currentClient.id)}
          onRequestPaymentConfirmation={requestConfirmation}
        />
        <MusicPlayer isOpen={isMusicPlayerOpen} onClose={() => setIsMusicPlayerOpen(false)} />
      </>
    );
  }

  // Admin area
  if (isAuthenticated && isAdmin) {
    const pendingPayments = getPendingPayments();
    const totalUnreadMessages = messages.filter(m => !m.read).length;

    const renderSection = () => {
      switch (activeSection) {
        case 'dashboard':
          return (
            <AdminDashboard
              clients={clients}
              workouts={workouts}
              diets={diets}
              payments={payments}
              messages={messages}
              schedules={schedules}
              onSectionChange={setActiveSection}
            />
          );
        case 'clients':
          return (
            <ClientsManager
              clients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          );
        case 'workouts':
          return (
            <WorkoutsManager
              clients={clients}
              workouts={workouts}
              onAddWorkout={addWorkout}
              onUpdateWorkout={updateWorkout}
              onDeleteWorkout={deleteWorkout}
              onGenerateAI={generateAIWorkout}
            />
          );
        case 'diets':
          return (
            <DietsManager
              clients={clients}
              diets={diets}
              onAddDiet={addDiet}
              onUpdateDiet={updateDiet}
              onDeleteDiet={deleteDiet}
              onGenerateAI={generateAIDiet}
            />
          );
        case 'messages':
          return (
            <MessagesManager
              clients={clients}
              messages={messages}
              onAddMessage={addMessage}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDeleteMessage={deleteMessage}
            />
          );
        case 'schedule':
          return (
            <ScheduleManager
              clients={clients}
              schedules={schedules}
              onAddSchedule={addSchedule}
              onUpdateSchedule={updateSchedule}
              onMarkAsCompleted={markAsCompleted}
              onCancelSchedule={cancelSchedule}
            />
          );
        case 'payments':
          return (
            <PaymentsManager
              clients={clients}
              payments={payments}
              onAddPayment={addPayment}
              onUpdatePayment={updatePayment}
              onMarkAsPaid={markAsPaid}
              onConfirmPayment={confirmPayment}
              onDeletePayment={deletePayment}
            />
          );
        case 'pdf':
          return (
            <PDFEditor
              clients={clients}
              workouts={workouts}
              diets={diets}
            />
          );
        case 'settings':
          return (
            <Settings
              onClearData={handleClearAllData}
            />
          );
        default:
          return (
            <AdminDashboard
              clients={clients}
              workouts={workouts}
              diets={diets}
              payments={payments}
              messages={messages}
              schedules={schedules}
              onSectionChange={setActiveSection}
            />
          );
      }
    };

    return (
      <div className="min-h-screen bg-[#0a0a0f] flex">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={logout}
          onToggleVoice={() => {}}
          onToggleMusic={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
          unreadMessages={totalUnreadMessages}
          pendingPayments={pendingPayments.length}
        />
        <main className="flex-1 ml-64 p-8">
          {renderSection()}
        </main>
        <MusicPlayer isOpen={isMusicPlayerOpen} onClose={() => setIsMusicPlayerOpen(false)} />
      </div>
    );
  }

  // Login screen
  return (
    <LoginScreen
      onLoginAdmin={loginAdmin}
      onLoginClient={loginClient}
      clients={clients}
    />
  );
}

export default App;
