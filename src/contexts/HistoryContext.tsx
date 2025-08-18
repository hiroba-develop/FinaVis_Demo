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
  initializeSampleHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const firstPeriodHistory: HistoricalData = {
  periodString: "第1期 (2024/4/1 - 2025/3/31)",
  startDate: new Date("2024-04-01T00:00:00.000Z"),
  endDate: new Date("2025-03-31T00:00:00.000Z"),
  balanceSheet: {
    assets: { "資産合計": 1750000, "流動資産": { "現金": 1750000 }, "固定資産": {} },
    liabilities: { "負債合計": 500000, "流動負債": {}, "固定負債": { "借入金": 500000 } },
    equity: { "純資産合計": 1250000, "資本金": 1000000, "利益剰余金": 250000 }
  },
  incomeStatement: {
    "収益": { "売上": 800000 },
    "費用": { "売上原価": { "仕入": 500000 }, "販売費及び一般管理費": { "給料": 200000 }, "営業外費用": {}, "特別損失": {}, "法人税等": {}, "費用合計": 700000 },
    "営業外収益": {},
    "特別利益": {},
    "当期純利益": 100000
  },
  cashFlowStatement: {
    operatingActivities: 100000,
    investingActivities: 0,
    financingActivities: 500000,
    netCashFlow: 600000,
    beginningCashBalance: 1150000, // 仮
    endingCashBalance: 1750000
  }
};


export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoricalData[]>([]);

  const addHistoricalData = useCallback((data: HistoricalData) => {
    setHistory(prevHistory => [...prevHistory, data]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const initializeSampleHistory = useCallback(() => {
    setHistory([firstPeriodHistory]);
  }, []);

  const value = { history, addHistoricalData, clearHistory, initializeSampleHistory };

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
