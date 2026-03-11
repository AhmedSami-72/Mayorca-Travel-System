import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plane, 
  Users, 
  UserRound, 
  FileText, 
  Search, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Pilgrims from './pages/Pilgrims';
import Agents from './pages/Agents';
import Flights from './pages/Flights';
import Reports from './pages/Reports';
import GlobalSearch from './pages/Search';
import Settings from './pages/Settings';
import { AppProvider } from './contexts/AppContext';
import './i18n';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-white/50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'trips', icon: Plane, label: t('trips') },
    { id: 'pilgrims', icon: Users, label: t('pilgrims') },
    { id: 'agents', icon: UserRound, label: t('agents') },
    { id: 'flights', icon: Plane, label: t('flights') },
    { id: 'reports', icon: FileText, label: t('reports') },
    { id: 'search', icon: Search, label: t('search') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'trips': return <Trips />;
      case 'pilgrims': return <Pilgrims />;
      case 'agents': return <Agents />;
      case 'flights': return <Flights />;
      case 'reports': return <Reports />;
      case 'search': return <GlobalSearch />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-[#f0f4f8] overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="glass-card m-4 mr-0 flex flex-col overflow-hidden transition-all duration-300 z-20"
        >
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-blue-600"
              >
                مايوركا ترافيل
              </motion.h1>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/50 text-slate-500"
            >
              {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={isSidebarOpen ? item.label : ''}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-white/20">
            <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                M
              </div>
              {isSidebarOpen && (
                <div>
                  <p className="text-sm font-bold text-slate-800">أدمن النظام</p>
                  <p className="text-xs text-slate-500">متصل الآن</p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppProvider>
  );
}
