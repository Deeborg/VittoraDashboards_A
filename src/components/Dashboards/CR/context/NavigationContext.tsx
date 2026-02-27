import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Dashboard']);

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      breadcrumbs,
      setBreadcrumbs,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};