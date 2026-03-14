import { useState } from 'react';
import { LandingScreen } from './sections/LandingScreen';
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
import { useAuth, useWorkouts, useDiets, usePayments, useMessages, useSchedule, useProgress, useSupabaseStatus, useClients } from './hooks';
import { Menu, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { 
    isAuthenticated, 
    isAdmin, 
    isClient, 
    loginAdmin, 
    loginClient, 
    logout, 
    getCurrentClient
  } = useAuth();

  const {
    clients,
    isLoadingClients,
    addClient: handleAddClient,
    updateClient: handleUpdateClient,
    deleteClient: handleDeleteClient
  } = useClients();

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

  const { isOnline } = useSupabaseStatus();

  const handleClearAllData = () => {
    localStorage.clear();
  };

  // Loading state
  if (isLoadingClients) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col pt-32 items-center text-red-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Carregando dados do banco online...</p>
      </div>
    );
  }

  // Client area
  if (isAuthenticated && isClient) {
    const currentClient = getCurrentClient(clients);
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
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-red-500/20 bg-[#0d0d12] sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AF</span>
             </div>
             <h2 className="text-lg font-bold text-white">AngraFit</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={logout}
          onToggleVoice={() => {}}
          onToggleMusic={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
          unreadMessages={totalUnreadMessages}
          pendingPayments={pendingPayments.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isOnline={isOnline}
        />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          {renderSection()}
        </main>
        <MusicPlayer isOpen={isMusicPlayerOpen} onClose={() => setIsMusicPlayerOpen(false)} />
      </div>
    );
  }

  // Login screen
  if (showLanding) {
    return <LandingScreen onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <LoginScreen
      onLoginAdmin={loginAdmin}
      onLoginClient={loginClient}
      clients={clients}
    />
  );
}

export default App;
