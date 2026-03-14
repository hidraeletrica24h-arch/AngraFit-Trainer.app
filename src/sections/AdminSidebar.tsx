import { 
  LayoutDashboard, Users, Dumbbell, Apple, MessageSquare, 
  Calendar, CreditCard, FileText, Settings, LogOut, Mic,
  Music
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  onToggleVoice: () => void;
  onToggleMusic: () => void;
  unreadMessages: number;
  pendingPayments: number;
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'diets', label: 'Dietas', icon: Apple },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare, badge: 'unreadMessages' },
  { id: 'schedule', label: 'Agenda', icon: Calendar },
  { id: 'payments', label: 'Pagamentos', icon: CreditCard, badge: 'pendingPayments' },
  { id: 'pdf', label: 'Editor PDF', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  onToggleVoice,
  onToggleMusic,
  unreadMessages,
  pendingPayments,
  isOpen,
  onClose,
  isOnline
}: AdminSidebarProps) {
  const getBadge = (item: typeof menuItems[0]) => {
    if (item.badge === 'unreadMessages' && unreadMessages > 0) {
      return unreadMessages;
    }
    if (item.badge === 'pendingPayments' && pendingPayments > 0) {
      return pendingPayments;
    }
    return 0;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#0d0d12] border-r border-red-500/20 
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-red-500/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center pulse-red">
              <Dumbbell className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AngraFit</h2>
              <p className="text-xs text-red-500">Admin Panel</p>
            </div>
          </div>
          {/* Close Menu Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            &times;
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const badge = getBadge(item);

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                      : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'}`}
                    strokeWidth={1.5}
                  />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions & Status */}
      <div className="p-4 border-t border-red-500/20">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onToggleVoice}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#111118] border border-red-500/20 text-gray-400 hover:text-red-500 hover:border-red-500/40 transition-all"
          >
            <Mic className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-xs">Voz</span>
          </button>
          <button
            onClick={onToggleMusic}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#111118] border border-red-500/20 text-gray-400 hover:text-red-500 hover:border-red-500/40 transition-all"
          >
            <Music className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-xs">Música</span>
          </button>
        </div>

        {/* Supabase Connection Status */}
        <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-[#111118] border border-red-500/10">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-2">
            Banco de Dados
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-wider font-bold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <div className="relative flex h-2.5 w-2.5">
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all font-medium"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
}
