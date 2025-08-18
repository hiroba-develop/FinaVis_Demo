import { createContext, useContext, useState, type ReactNode, useMemo, useCallback, useEffect } from 'react';

interface FiscalPeriodContextType {
  startDate: Date | null;
  setStartDate: (date: Date, isSample?: boolean) => void;
  endDate: Date | null;
  advanceToNextPeriod: () => void;
  periodString: string;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  resetFiscalPeriod: () => void;
  setupSamplePeriod: () => void; // Add new function
  isInitialSetup: boolean;
}

const FiscalPeriodContext = createContext<FiscalPeriodContextType | undefined>(undefined);

export const FiscalPeriodProvider = ({ children }: { children: ReactNode }) => {
  const [startDate, setStartDateState] = useState<Date | null>(() => {
    const storedDate = localStorage.getItem('fiscalStartDate');
    return storedDate ? new Date(storedDate) : null;
  });
  
  const [originalStartDate, setOriginalStartDate] = useState<Date | null>(() => {
    const storedDate = localStorage.getItem('originalStartDate');
    return storedDate ? new Date(storedDate) : null;
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [isInitialSetup, setIsInitialSetup] = useState(() => {
    return !localStorage.getItem('fiscalStartDate');
  });

  useEffect(() => {
    if (startDate) {
      localStorage.setItem('fiscalStartDate', startDate.toISOString());
    } else {
      localStorage.removeItem('fiscalStartDate');
    }
  }, [startDate]);

  useEffect(() => {
    if (originalStartDate) {
      localStorage.setItem('originalStartDate', originalStartDate.toISOString());
    } else {
      localStorage.removeItem('originalStartDate');
    }
  }, [originalStartDate]);

  useEffect(() => {
    if (isInitialSetup && startDate === null) {
      setIsSettingsModalOpen(true);
    }
  }, [isInitialSetup, startDate]);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  const setStartDate = (date: Date, isSample = false) => {
    let effectiveStartDate = new Date(date);

    const firstDateToSet = !originalStartDate ? effectiveStartDate : originalStartDate;
    if (!originalStartDate) {
        setOriginalStartDate(effectiveStartDate);
    }

    const localToday = new Date();
    const today = new Date(Date.UTC(localToday.getUTCFullYear(), localToday.getUTCMonth(), localToday.getUTCDate()));

    // Only fast-forward the date if it's NOT sample data
    if (!isSample && firstDateToSet < today) {
        let currentPeriodStartDate = new Date(firstDateToSet);
        while (true) {
            const nextPeriodEnd = new Date(currentPeriodStartDate);
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
            
            if (today < nextPeriodEnd) {
                break;
            }
            
            currentPeriodStartDate.setFullYear(currentPeriodStartDate.getFullYear() + 1);
        }
        effectiveStartDate = currentPeriodStartDate;
    }

    setStartDateState(effectiveStartDate);
    setIsInitialSetup(false);
    closeSettingsModal();
  };

  const resetFiscalPeriod = () => {
    setStartDateState(null);
    setOriginalStartDate(null);
    setIsInitialSetup(true);
  };

  const setupSamplePeriod = () => {
    const firstPeriodStart = new Date(Date.UTC(2024, 3, 1));
    const secondPeriodStart = new Date(Date.UTC(2025, 3, 1));
    setOriginalStartDate(firstPeriodStart);
    setStartDateState(secondPeriodStart);
    setIsInitialSetup(false);
    closeSettingsModal();
  };

  const endDate = useMemo(() => {
    if (!startDate) return null;
    const end = new Date(startDate.getTime());
    end.setUTCFullYear(end.getUTCFullYear() + 1);
    end.setUTCDate(end.getUTCDate() - 1);
    return end;
  }, [startDate]);

  const periodString = useMemo(() => {
    if (!startDate || !endDate) {
      return "未設定";
    }
    const baseDate = originalStartDate || startDate;
    
    // Helper function to determine the fiscal year for a given date
    const getFiscalYear = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const fiscalStartMonth = baseDate.getUTCMonth();
      // If the date's month is before the fiscal start month, it belongs to the previous fiscal year
      return month < fiscalStartMonth ? year - 1 : year;
    };

    const startFiscalYear = getFiscalYear(startDate);
    const baseFiscalYear = getFiscalYear(baseDate);

    const periodNumber = startFiscalYear - baseFiscalYear + 1;

    const startStr = startDate.toLocaleDateString('ja-JP', { timeZone: 'UTC' });
    const endStr = endDate.toLocaleDateString('ja-JP', { timeZone: 'UTC' });
    return `第${periodNumber}期 (${startStr} - ${endStr})`;
  }, [startDate, endDate, originalStartDate]);

  const advanceToNextPeriod = useCallback(() => {
    setStartDateState(currentStartDate => {
      if (!currentStartDate) return null;
      const nextStartDate = new Date(currentStartDate.getTime());
      nextStartDate.setUTCFullYear(nextStartDate.getUTCFullYear() + 1);
      return nextStartDate;
    });
  }, []);

  const value = {
    startDate,
    setStartDate,
    endDate,
    advanceToNextPeriod,
    periodString,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    resetFiscalPeriod,
    setupSamplePeriod, // Expose new function
    isInitialSetup,
  };

  return (
    <FiscalPeriodContext.Provider value={value}>
      {children}
    </FiscalPeriodContext.Provider>
  );
};

export const useFiscalPeriod = (): FiscalPeriodContextType => {
  const context = useContext(FiscalPeriodContext);
  if (context === undefined) {
    throw new Error('useFiscalPeriod must be used within a FiscalPeriodProvider');
  }
  return context;
};
