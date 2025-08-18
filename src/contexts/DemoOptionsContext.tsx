import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { useFiscalPeriod } from './FiscalPeriodContext';
import { useHistory } from './HistoryContext';

interface DemoOptionsContextType {
  useSampleData: boolean;
  setUseSampleData: (use: boolean) => void;
  toggleDemoData: () => void;
}

const DemoOptionsContext = createContext<DemoOptionsContextType | undefined>(undefined);

export const DemoOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [useSampleData, setUseSampleDataState] = useState(() => {
    const storedValue = localStorage.getItem('useSampleData');
    // Default to true if nothing is stored
    return storedValue !== null ? JSON.parse(storedValue) : true; 
  });
  
  const { resetFiscalPeriod, setStartDate } = useFiscalPeriod();
  const { clearHistory } = useHistory();

  useEffect(() => {
    localStorage.setItem('useSampleData', JSON.stringify(useSampleData));
  }, [useSampleData]);

  const setUseSampleData = (use: boolean) => {
    setUseSampleDataState(use);
  };
  
  const toggleDemoData = useCallback(() => {
    const newUseSampleData = !useSampleData;
    setUseSampleDataState(newUseSampleData);
    
    // Reset all related states
    resetFiscalPeriod();
    clearHistory();

    // If switching to sample data, set its specific start date
    if (newUseSampleData) {
      const sampleStartDate = new Date(Date.UTC(2024, 3, 1)); // April 1st
      setStartDate(sampleStartDate);
    }
    // If switching to initial data, the resetFiscalPeriod() call will
    // automatically trigger the settings modal because startDate will be null.

  }, [useSampleData, resetFiscalPeriod, clearHistory, setStartDate]);

  const value = { useSampleData, setUseSampleData, toggleDemoData };

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
