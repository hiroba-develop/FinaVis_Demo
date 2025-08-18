import { createContext, useContext, useState, type ReactNode } from 'react';

interface DemoOptionsContextType {
  useSampleData: boolean;
  setUseSampleData: (use: boolean) => void;
}

const DemoOptionsContext = createContext<DemoOptionsContextType | undefined>(undefined);

export const DemoOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [useSampleData, setUseSampleData] = useState(true); // Default to true

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
