// src/context/DashboardContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DashboardContextType {
  currencyFilter: string;
  setCurrencyFilter: (filter: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  realtimeUpdates: boolean;
  setRealtimeUpdates: (updates: boolean) => void;
  showAnimations: boolean;
  setShowAnimations: (animations: boolean) => void;
  currencyFormat: string;
  setCurrencyFormat: (format: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  refreshInterval: string;
  setRefreshInterval: (interval: string) => void;
  emailAlerts: boolean;
  setEmailAlerts: (alerts: boolean) => void;
  riskAlerts: boolean;
  setRiskAlerts: (alerts: boolean) => void;
  paymentReminders: boolean;
  setPaymentReminders: (reminders: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [darkMode, setDarkMode] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [showAnimations, setShowAnimations] = useState(true);
  const [currencyFormat, setCurrencyFormat] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [refreshInterval, setRefreshInterval] = useState('5 minutes');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);

  return (
    <DashboardContext.Provider
      value={{
        currencyFilter,
        setCurrencyFilter,
        darkMode,
        setDarkMode,
        realtimeUpdates,
        setRealtimeUpdates,
        showAnimations,
        setShowAnimations,
        currencyFormat,
        setCurrencyFormat,
        dateFormat,
        setDateFormat,
        refreshInterval,
        setRefreshInterval,
        emailAlerts,
        setEmailAlerts,
        riskAlerts,
        setRiskAlerts,
        paymentReminders,
        setPaymentReminders,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};