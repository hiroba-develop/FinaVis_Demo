import { createContext, useContext, useState, type ReactNode, useMemo, useCallback, useEffect } from 'react';

interface FiscalPeriodContextType {
  startDate: Date | null;
  setStartDate: (date: Date) => void;
  endDate: Date | null;
  advanceToNextPeriod: () => void;
  periodString: string;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  resetFiscalPeriod: () => void;
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

  const setStartDate = (date: Date) => {
    let effectiveStartDate = new Date(date);

    const firstDateToSet = !originalStartDate ? effectiveStartDate : originalStartDate;
    if (!originalStartDate) {
        setOriginalStartDate(effectiveStartDate);
    }

    const localToday = new Date();
    const today = new Date(Date.UTC(localToday.getUTCFullYear(), localToday.getUTCMonth(), localToday.getUTCDate()));

    if (firstDateToSet < today) {
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
    const periodNumber = startDate.getUTCFullYear() - baseDate.getUTCFullYear() + 1;
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
