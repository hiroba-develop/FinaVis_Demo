import  { createContext, useContext, useState, type ReactNode, useEffect, useMemo } from 'react';
import type { Transaction, BalanceSheet, IncomeStatement, CashFlowStatement, Account, SimpleTransaction, TransactionTemplate } from '../types';
import { useFiscalPeriod } from './FiscalPeriodContext'; // FiscalPeriodContextをインポート

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'transactionId' | 'userId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  addSimpleTransaction: (simpleTransaction: SimpleTransaction) => void;
  balanceSheet: BalanceSheet;
  incomeStatement: IncomeStatement;
  cashFlowStatement: CashFlowStatement;
  accountsMaster: Account[];
  transactionTemplates: TransactionTemplate[];
  recordClosingBalanceSheet: () => void; // recordClosingBalanceSheetを追加
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// 初期状態
const initialBalanceSheet: BalanceSheet = {
  assets: { 資産合計: 0, 流動資産: {}, 固定資産: {} },
  liabilities: { 負債合計: 0, 流動負債: {}, 固定負債: {} },
  equity: { 純資産合計: 0, 資本金: 0, 利益剰余金: 0 },
};
const initialIncomeStatement: IncomeStatement = {
    収益: {},
    費用: { 
        売上原価: {}, 
        販売費及び一般管理費: {}, 
        営業外費用: {}, 
        特別損失: {}, 
        法人税等: {}, 
        費用合計: 0 
    },
    営業外収益: {},
    特別利益: {},
    当期純利益: 0,
};
const initialCashFlowStatement: CashFlowStatement = {
    operatingActivities: 600000,
    investingActivities: -300000,
    financingActivities: 100000,
    netCashFlow: 400000,
    beginningCashBalance: 0,
    endingCashBalance: 0,
};

// --- Dynamic Sample Data Generation ---
const generateSampleTransactions = (periodStartDate: Date): Transaction[] => {
  const allTransactions: Transaction[] = [];
  let transactionIdCounter = 1;

  const today = new Date();
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth();
  
  const periodStartYear = periodStartDate.getUTCFullYear();
  const periodStartMonth = periodStartDate.getUTCMonth();

  // Iterate from the start of the fiscal period up to the current real-world month
  for (let year = periodStartYear; year <= currentYear; year++) {
    const startMonth = (year === periodStartYear) ? periodStartMonth : 0;
    const endMonth = (year === currentYear) ? currentMonth : 11;

    for (let month = startMonth; month <= endMonth; month++) {
      const d = (day: number) => new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
      
      // Add a few transactions for each month
      allTransactions.push(
        {
          transactionId: transactionIdCounter++, userId: 1, transactionDate: d(5),
          description: `商品を${600000 + month * 10000}円で現金で仕入れた`,
          entries: [
            { entryId: 1, transactionId: 1, accountId: 8, debitAmount: 600000 + month * 10000, creditAmount: 0 },
            { entryId: 2, transactionId: 1, accountId: 1, debitAmount: 0, creditAmount: 600000 + month * 10000 },
          ],
        },
        {
          transactionId: transactionIdCounter++, userId: 1, transactionDate: d(15),
          description: `商品を${950000 + month * 15000}円で売上げ、代金は掛けとした`,
          entries: [
            { entryId: 3, transactionId: 2, accountId: 2, debitAmount: 950000 + month * 15000, creditAmount: 0 },
            { entryId: 4, transactionId: 2, accountId: 7, debitAmount: 0, creditAmount: 950000 + month * 15000 },
          ],
        },
        {
          transactionId: transactionIdCounter++, userId: 1, transactionDate: d(25),
          description: `従業員の給料220,000円を現金で支払った`,
          entries: [
            { entryId: 5, transactionId: 3, accountId: 9, debitAmount: 220000, creditAmount: 0 },
            { entryId: 6, transactionId: 3, accountId: 1, debitAmount: 0, creditAmount: 220000 },
          ],
        }
      );
    }
  }

  return allTransactions;
};


// 仮の勘定科目マスタ (初学者向けに簡略化)
const accountsMaster: Account[] = [
  { id: 1, name: '現金', type: 'asset', sub_type: 'current' },
  { id: 19, name: '普通預金', type: 'asset', sub_type: 'current' },
  { id: 2, name: '売掛金', type: 'asset', sub_type: 'current' },
  { id: 10, name: '備品', type: 'asset', sub_type: 'fixed' },
  { id: 30, name: '減価償却累計額', type: 'asset', sub_type: 'fixed' },
  { id: 4, name: '買掛金', type: 'liability', sub_type: 'current' },
  { id: 5, name: '借入金', type: 'liability', sub_type: 'fixed' },
  { id: 6, name: '資本金', type: 'equity', sub_type: null },
  { id: 15, name: '利益剰余金', type: 'equity', sub_type: null },
  { id: 7, name: '売上', type: 'revenue', sub_type: null },
  { id: 8, name: '仕入', type: 'expense', sub_type: 'cogs' },
  { id: 9, name: '給料', type: 'expense', sub_type: 'sga' },
  { id: 23, name: '地代家賃', type: 'expense', sub_type: 'sga' },
  { id: 24, name: '水道光熱費', type: 'expense', sub_type: 'sga' },
  { id: 11, name: '消耗品費', type: 'expense', sub_type: 'sga' }, // その他経費として利用
  { id: 29, name: '減価償却費', type: 'expense', sub_type: 'sga' },
];

const transactionTemplates: TransactionTemplate[] = [
    // 売上
    { id: 'revenue-cash', label: '現金での売上', category: '売上', debitAccountId: 1, creditAccountId: 7 },
    { id: 'revenue-receivable', label: '掛けでの売上', category: '売上', debitAccountId: 2, creditAccountId: 7 },
    { id: 'receivable-collection', label: '売掛金の回収', category: '売上', debitAccountId: 1, creditAccountId: 2 }, // 現金での回収をデフォルトに

    // 仕入
    { id: 'purchase-cash', label: '現金での仕入', category: '仕入', debitAccountId: 8, creditAccountId: 1 },
    { id: 'purchase-payable', label: '掛けでの仕入', category: '仕入', debitAccountId: 8, creditAccountId: 4 },
    { id: 'payable-payment', label: '買掛金の支払い', category: '仕入', debitAccountId: 4, creditAccountId: 1 }, // 現金での支払いをデフォルトに

    // 経費
    { id: 'expense-salary', label: '給料の支払い', category: '経費', debitAccountId: 9, creditAccountId: 1 },
    { id: 'expense-rent', label: '家賃の支払い', category: '経費', debitAccountId: 23, creditAccountId: 1 },
    { id: 'expense-utilities', label: '光熱費の支払い', category: '経費', debitAccountId: 24, creditAccountId: 1 },
    { id: 'expense-other', label: 'その他経費の支払い', category: '経費', debitAccountId: 11, creditAccountId: 1 },

    // 資産
    { id: 'asset-purchase', label: '設備・備品の購入', category: '資産', debitAccountId: 10, creditAccountId: 1 }, // 現金での購入をデフォルトに
    { id: 'asset-depreciation', label: '減価償却', category: '資産', debitAccountId: 29, creditAccountId: 30 },

    // 資金
    { id: 'loan-borrow', label: '借入', category: '資金', debitAccountId: 19, creditAccountId: 5 }, // 普通預金への入金をデフォルトに
    { id: 'loan-repay', label: '借入金の返済', category: '資金', debitAccountId: 5, creditAccountId: 1 },
    { id: 'capital-invest', label: '出資', category: '資金', debitAccountId: 1, creditAccountId: 6 },

    // 現金・預金
    { id: 'cash-deposit', label: '現金を預金に預ける', category: '現金・預金', debitAccountId: 19, creditAccountId: 1 },
    { id: 'bank-withdrawal', label: '預金から現金を引き出す', category: '現金・預金', debitAccountId: 1, creditAccountId: 19 },
];


export const TransactionProvider = ({ 
  children, 
  useSampleData,
  initialBalanceSheet: initialBalanceSheetProp,
  onPeriodClose,
}: { 
  children: ReactNode, 
  useSampleData: boolean,
  initialBalanceSheet?: BalanceSheet,
  onPeriodClose?: (closingBalanceSheet: BalanceSheet) => void,
}) => {
  const { startDate, endDate } = useFiscalPeriod();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet>(initialBalanceSheet);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement>(initialIncomeStatement);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement>(initialCashFlowStatement);

  const dynamicSampleTransactions = useMemo(() => {
    if (!startDate) return [];
    return generateSampleTransactions(startDate);
  }, [startDate]);

  useEffect(() => {
    setTransactions(useSampleData ? dynamicSampleTransactions : []);
  }, [useSampleData, dynamicSampleTransactions]);

  const calculateFinancials = (currentTransactions: Transaction[]) => {
    // --- Return empty statements if the fiscal period is not set ---
    if (!startDate || !endDate) {
      setBalanceSheet(initialBalanceSheet);
      setIncomeStatement(initialIncomeStatement);
      setCashFlowStatement(initialCashFlowStatement);
      return;
    }

    // --- B/S and P/L Calculation ---
    const bs: BalanceSheet = JSON.parse(JSON.stringify(initialBalanceSheetProp || initialBalanceSheet));
    const is: IncomeStatement = JSON.parse(JSON.stringify(initialIncomeStatement));
    
    // The opening balance for retained earnings is already included in the initialBalanceSheetProp
    
    // Filter transactions for the current fiscal period
    const periodTransactions = currentTransactions.filter(tx => {
        const txDate = new Date(tx.transactionDate);
        return txDate >= startDate && txDate <= endDate;
    });

    periodTransactions.forEach(tx => {
      tx.entries.forEach(entry => {
        const account = accountsMaster.find(a => a.id === entry.accountId);
        if (!account) return;

        const amount = entry.debitAmount - entry.creditAmount;

        switch (account.type) {
          case 'asset':
            if (account.sub_type === 'current') bs.assets.流動資産[account.name] = (bs.assets.流動資産[account.name] || 0) + amount;
            else bs.assets.固定資産[account.name] = (bs.assets.固定資産[account.name] || 0) + amount;
            break;
          case 'liability':
            if (account.sub_type === 'current') bs.liabilities.流動負債[account.name] = (bs.liabilities.流動負債[account.name] || 0) - amount;
            else bs.liabilities.固定負債[account.name] = (bs.liabilities.固定負債[account.name] || 0) - amount;
            break;
          case 'equity':
            if (account.name === '資本金') {
                bs.equity.資本金 = (bs.equity.資本金 || 0) - amount;
            } else {
                bs.equity.利益剰余金 = (bs.equity.利益剰余金 || 0) - amount;
            }
            break;
          case 'revenue':
            if (account.sub_type === 'non-operating-revenue') is.営業外収益[account.name] = (is.営業外収益[account.name] || 0) - amount;
            else if (account.sub_type === 'extraordinary-profit') is.特別利益[account.name] = (is.特別利益[account.name] || 0) - amount;
            else is.収益[account.name] = (is.収益[account.name] || 0) - amount;
            break;
          case 'expense':
            if (account.sub_type === 'cogs') is.費用.売上原価[account.name] = (is.費用.売上原価[account.name] || 0) + amount;
            else if (account.sub_type === 'sga') is.費用.販売費及び一般管理費[account.name] = (is.費用.販売費及び一般管理費[account.name] || 0) + amount;
            else if (account.sub_type === 'non-operating-expense') is.費用.営業外費用[account.name] = (is.費用.営業外費用[account.name] || 0) + amount;
            else if (account.sub_type === 'extraordinary-loss') is.費用.特別損失[account.name] = (is.費用.特別損失[account.name] || 0) + amount;
            else if (account.sub_type === 'tax') is.費用.法人税等[account.name] = (is.費用.法人税等[account.name] || 0) + amount;
            break;
        }
      });
    });

    const totalRevenue = Object.values(is.収益).reduce((s, v) => s + v, 0);
    const totalCOGS = Object.values(is.費用.売上原価).reduce((s, v) => s + v, 0);
    const totalSGA = Object.values(is.費用.販売費及び一般管理費).reduce((s, v) => s + v, 0);
    const totalNonOperatingExpenses = Object.values(is.費用.営業外費用).reduce((s, v) => s + v, 0);
    const totalExtraordinaryLosses = Object.values(is.費用.特別損失).reduce((s, v) => s + v, 0);
    const totalTax = Object.values(is.費用.法人税等).reduce((s, v) => s + v, 0);
    const totalNonOperatingRevenue = Object.values(is.営業外収益).reduce((s, v) => s + v, 0);
    const totalExtraordinaryProfit = Object.values(is.特別利益).reduce((s, v) => s + v, 0);
    
    is.費用.費用合計 = totalCOGS + totalSGA + totalNonOperatingExpenses + totalExtraordinaryLosses + totalTax;
    is.当期純利益 = totalRevenue + totalNonOperatingRevenue + totalExtraordinaryProfit - (totalCOGS + totalSGA + totalNonOperatingExpenses + totalExtraordinaryLosses + totalTax);
    
    // Recalculate equity based on accumulated values
    bs.assets.資産合計 = Object.values(bs.assets.流動資産).reduce((s, v) => s + v, 0) + Object.values(bs.assets.固定資産).reduce((s, v) => s + v, 0);
    bs.liabilities.負債合計 = Object.values(bs.liabilities.流動負債).reduce((s, v) => s + v, 0) + Object.values(bs.liabilities.固定負債).reduce((s, v) => s + v, 0);
    
    // 利益剰余金の計算を修正：期首の利益剰余金（initialBalanceSheetPropから）＋当期純利益
    const openingRetainedEarnings = initialBalanceSheetProp?.equity.利益剰余金 || 0;
    const closingRetainedEarnings = openingRetainedEarnings + is.当期純利益;

    // Add the net income for the period to the initial retained earnings.
    bs.equity.利益剰余金 = closingRetainedEarnings;

    bs.equity.純資産合計 = bs.equity.資本金 + bs.equity.利益剰余金;

    // --- Dynamic C/F Calculation (New Logic) ---
    const cf: CashFlowStatement = JSON.parse(JSON.stringify(initialCashFlowStatement));
    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;
    const cashAccountIds = [1, 19]; // Cash and Bank Account

    periodTransactions.forEach(tx => {
        const cashEntry = tx.entries.find(e => cashAccountIds.includes(e.accountId));
        if (!cashEntry) return; // Not a cash transaction

        const cashMovement = cashEntry.debitAmount - cashEntry.creditAmount;
        
        // Find the "other side" of the transaction to classify the cash flow
        const otherEntries = tx.entries.filter(e => !cashAccountIds.includes(e.accountId));
        
        // This is a simplified classification logic, assuming one major "other" account type per transaction
        let category = 'operating'; // Default
        for (const otherEntry of otherEntries) {
            const account = accountsMaster.find(a => a.id === otherEntry.accountId);
            if (account) {
                if (account.type === 'asset' && account.sub_type === 'fixed') {
                    category = 'investing';
                    break;
                }
                if ((account.type === 'liability' && account.sub_type === 'fixed') || account.type === 'equity') {
                    category = 'financing';
                    break;
                }
            }
        }

        if (category === 'investing') investingActivities += cashMovement;
        else if (category === 'financing') financingActivities += cashMovement;
        else operatingActivities += cashMovement;
    });

    cf.operatingActivities = operatingActivities;
    cf.investingActivities = investingActivities;
    cf.financingActivities = financingActivities;
    
    // Calculate net cash flow from the sum of activities
    const calculatedNetCashFlow = operatingActivities + investingActivities + financingActivities;
    cf.netCashFlow = calculatedNetCashFlow;
    
    // Calculate ending balance based on flow
    const cashAtStart = (initialBalanceSheetProp?.assets.流動資産['現金'] || 0) + (initialBalanceSheetProp?.assets.流動資産['普通預金'] || 0);
    cf.beginningCashBalance = cashAtStart;
    const cashOnHand = (bs.assets.流動資産['現金'] || 0) + (bs.assets.流動資産['普通預金'] || 0);
    cf.endingCashBalance = cashOnHand;

    // Optional: Log a warning if B/S cash doesn't match C/F calculation
    const endingCashOnBS = (bs.assets.流動資産['現金'] || 0) + (bs.assets.流動資産['普通預金'] || 0);
    if (Math.round(cf.endingCashBalance) !== Math.round(endingCashOnBS)) {
        console.warn(`C/F ending balance (${cf.endingCashBalance}) does not match B/S cash (${endingCashOnBS}). This might indicate a transaction classification issue.`);
    }

    setBalanceSheet(bs);
    setIncomeStatement(is);
    setCashFlowStatement(cf);
  };

  // Function to be called from Dashboard to save the B/S before advancing the period.
  const recordClosingBalanceSheet = () => {
    if (onPeriodClose) {
      onPeriodClose(balanceSheet);
    }
  };

  useEffect(() => {
    calculateFinancials(transactions);
  }, [transactions, startDate, endDate, initialBalanceSheetProp]); // Add dependencies

  const addTransaction = (transaction: Omit<Transaction, 'transactionId' | 'userId'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      transactionId: transactions.length + 1,
      userId: 1, // 仮
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.transactionId === updatedTransaction.transactionId ? updatedTransaction : tx
      )
    );
  };

  const addSimpleTransaction = (simpleTransaction: SimpleTransaction) => {
    const template = transactionTemplates.find(t => t.id === simpleTransaction.templateId);
    if (!template) {
        console.error("Invalid transaction template ID");
        return;
    }

    const newTransactionData = {
        transactionDate: simpleTransaction.transactionDate,
        description: simpleTransaction.description,
        entries: [
            {
                entryId: 0, // temp
                transactionId: 0, // temp
                accountId: template.debitAccountId,
                debitAmount: simpleTransaction.amount,
                creditAmount: 0,
            },
            {
                entryId: 1, // temp
                transactionId: 0, // temp
                accountId: template.creditAccountId,
                debitAmount: 0,
                creditAmount: simpleTransaction.amount,
            }
        ]
    };

    addTransaction(newTransactionData);
  }

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    addSimpleTransaction,
    balanceSheet,
    incomeStatement,
    cashFlowStatement,
    accountsMaster,
    transactionTemplates,
    recordClosingBalanceSheet, // Expose the new function
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};