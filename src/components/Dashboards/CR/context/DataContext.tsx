import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  mockAuditLogs,
  mockSODViolations,
  mockFraudAlerts,
  mockAccessPermissions,
  mockStatutoryFilings,
  mockAuditFindings,
  mockUsers,
} from '../data/mockData';
import {
  AuditLog,
  SODViolation,
  FraudAlert,
  AccessPermission,
  StatutoryFiling,
  AuditFinding,
  User,
} from '../types';

interface DataContextType {
  auditLogs: AuditLog[];
  sodViolations: SODViolation[];
  fraudAlerts: FraudAlert[];
  accessPermissions: AccessPermission[];
  statutoryFilings: StatutoryFiling[];
  auditFindings: AuditFinding[];
  users: User[];
  loading: boolean;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sodViolations, setSodViolations] = useState<SODViolation[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [accessPermissions, setAccessPermissions] = useState<AccessPermission[]>([]);
  const [statutoryFilings, setStatutoryFilings] = useState<StatutoryFiling[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [users] = useState<User[]>(mockUsers);

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setSodViolations(mockSODViolations);
      setFraudAlerts(mockFraudAlerts);
      setAccessPermissions(mockAccessPermissions);
      setStatutoryFilings(mockStatutoryFilings);
      setAuditFindings(mockAuditFindings);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{
      auditLogs,
      sodViolations,
      fraudAlerts,
      accessPermissions,
      statutoryFilings,
      auditFindings,
      users,
      loading,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};