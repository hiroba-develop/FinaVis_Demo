import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface DemoOptionsContextType {
  useSampleData: boolean;
  setUseSampleData: (use: boolean) => void;
}

const DemoOptionsContext = createContext<DemoOptionsContextType | undefined>(undefined);

export const DemoOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [useSampleData, setUseSampleDataState] = useState(() => {
    const storedValue = localStorage.getItem('useSampleData');
    // Default to true if nothing is stored
    return storedValue !== null ? JSON.parse(storedValue) : true; 
  });

  useEffect(() => {
    localStorage.setItem('useSampleData', JSON.stringify(useSampleData));
  }, [useSampleData]);

  const setUseSampleData = (use: boolean) => {
    setUseSampleDataState(use);
  };

  const value = { useSampleData, setUseSampleData };

  return (
    <DemoOptionsContext.Provider value={value}>
      {children}
    </DemoOptionsContext.Provider>
  );
};

export const useDemoOptions = (): DemoOptionsContextType => {
  const context = useContext(DemoOptionsContext);
  if (context === undefined) {
    throw new Error('useDemoOptions must be used within a DemoOptionsProvider');
  }
  return context;
};
