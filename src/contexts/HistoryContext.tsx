import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import type { BalanceSheet, IncomeStatement, CashFlowStatement } from '../types';

export interface HistoricalData {
  periodString: string;
  startDate: Date;
  endDate: Date;
  balanceSheet: BalanceSheet;
  incomeStatement: IncomeStatement;
  cashFlowStatement: CashFlowStatement;
}

interface HistoryContextType {
  history: HistoricalData[];
  addHistoricalData: (data: HistoricalData) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoricalData[]>([]);

  const addHistoricalData = useCallback((data: HistoricalData) => {
    setHistory(prevHistory => [...prevHistory, data]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = { history, addHistoricalData, clearHistory };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
