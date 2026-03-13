import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AppContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  stats: any;
  refreshStats: () => void;
  trips: any[];
  agents: any[];
  refreshTrips: () => void;
  refreshAgents: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('umrah_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalPilgrims: 0,
    totalAgents: 0,
    completedTrips: 0,
    incompleteTrips: 0
  });
  const [trips, setTrips] = useState([]);
  const [agents, setAgents] = useState([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('umrah_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('umrah_user');
  };

  const fetchWithRetry = async (url: string, retries = 5, delay = 1000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        console.warn(`Fetch failed for ${url}, retrying in ${delay}ms...`, e);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const refreshStats = async () => {
    try {
      const data = await fetchWithRetry('/api/stats');
      setStats(data);
    } catch (e) {
      console.error('Failed to refresh stats:', e);
    }
  };

  const refreshTrips = async () => {
    try {
      const data = await fetchWithRetry('/api/trips');
      setTrips(data);
    } catch (e) {
      console.error('Failed to refresh trips:', e);
    }
  };

  const refreshAgents = async () => {
    try {
      const data = await fetchWithRetry('/api/agents');
      setAgents(data);
    } catch (e) {
      console.error('Failed to refresh agents:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const settings = await fetchWithRetry('/api/settings');
      if (settings.theme) {
        setTheme(settings.theme);
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'theme', value: newTheme })
      });
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  useEffect(() => {
    refreshStats();
    refreshTrips();
    refreshAgents();
    fetchSettings();

    const socket = io();

    socket.on('pilgrim_updated', (data) => {
      console.log('Real-time update received:', data);
      
      // Refresh relevant data
      refreshStats();
      refreshTrips();
      
      // Show notification
      if (data.type === 'create') {
        toast.success(t('pilgrim_added_success'), {
          description: data.pilgrim.full_name
        });
      } else if (data.type === 'update') {
        toast.info(t('pilgrim_updated_success'), {
          description: data.pilgrim.full_name
        });
      } else if (data.type === 'delete') {
        toast.warning(t('pilgrim_deleted_success'));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, login, logout,
      stats, refreshStats, trips, agents, refreshTrips, refreshAgents, 
      theme, toggleTheme, searchQuery, setSearchQuery,
      activeTab, setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
