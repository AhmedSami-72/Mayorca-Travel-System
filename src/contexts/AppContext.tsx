import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  stats: any;
  refreshStats: () => void;
  trips: any[];
  agents: any[];
  refreshTrips: () => void;
  refreshAgents: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalPilgrims: 0,
    totalAgents: 0,
    completedTrips: 0,
    incompleteTrips: 0
  });
  const [trips, setTrips] = useState([]);
  const [agents, setAgents] = useState([]);

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      setTrips(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshStats();
    refreshTrips();
    refreshAgents();
  }, []);

  return (
    <AppContext.Provider value={{ stats, refreshStats, trips, agents, refreshTrips, refreshAgents }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
