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
  ChevronRight,
  Moon,
  Sun,
  LogIn
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
import Login from './pages/Login';
import { useAppContext } from './contexts/AppContext';
import { Toaster } from 'sonner';
import './i18n';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={20} />
    {label && <span className="font-medium">{label}</span>}
  </button>
);

export default function App() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, activeTab, setActiveTab, user, logout } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Login />
      </>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'trips', icon: Plane, label: t('trips') },
    { id: 'pilgrims', icon: Users, label: t('pilgrims') },
    { id: 'agents', icon: UserRound, label: t('agents') },
    { id: 'reports', icon: FileText, label: t('reports') },
    { id: 'search', icon: Search, label: t('search') },
    ...(user.role === 'Admin' ? [{ id: 'settings', icon: SettingsIcon, label: t('settings') }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'trips': return <Trips />;
      case 'pilgrims': return <Pilgrims />;
      case 'agents': return <Agents />;
      case 'reports': return <Reports />;
      case 'search': return <GlobalSearch />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <Toaster position="top-center" richColors />
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 z-20 shadow-sm"
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
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${!isSidebarOpen && 'justify-center'}`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {isSidebarOpen && <span className="font-medium">{theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}</span>}
          </button>

          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              {user.username[0].toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.username}</p>
                <p className="text-[10px] text-slate-500">{user.role === 'Admin' ? 'مدير النظام' : 'مستخدم عادي'}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="تسجيل الخروج"
              >
                <LogIn size={18} className="rotate-180" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-slate-50 dark:bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full pb-20"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer Branding */}
        <footer className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
          <p>تم التطوير بواسطة أحمد سامي</p>
          <p>رقم الهاتف: 010333842339</p>
        </footer>
      </main>
    </div>
  );
}
