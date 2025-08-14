import  { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Transaction, BalanceSheet, IncomeStatement, CashFlowStatement, Account, SimpleTransaction, TransactionTemplate } from '../types';

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
    費用: { 売上原価: {}, 販売費及び一般管理費: {}, 法人税等: {}, 費用合計: 0 },
    当期純利益: 0,
};
const initialCashFlowStatement: CashFlowStatement = {
    operatingActivities: 600000,
    investingActivities: -300000,
    financingActivities: 100000,
    netCashFlow: 400000,
    beginningCashBalance: 200000,
    endingCashBalance: 600000,
};

// デモ用の初期データ
const sampleTransactions: Transaction[] = [
  {
    transactionId: 1,
    userId: 1,
    transactionDate: '2023-04-01',
    description: '事業開始のため、資本金1,000,000円を現金で受け入れた',
    entries: [
      { entryId: 1, transactionId: 1, accountId: 1, debitAmount: 1000000, creditAmount: 0 },
      { entryId: 2, transactionId: 1, accountId: 6, debitAmount: 0, creditAmount: 1000000 },
    ],
  },
  {
    transactionId: 2,
    userId: 1,
    transactionDate: '2023-04-05',
    description: '商品を500,000円で現金で仕入れた',
    entries: [
      { entryId: 3, transactionId: 2, accountId: 8, debitAmount: 500000, creditAmount: 0 }, // 仕入
      { entryId: 4, transactionId: 2, accountId: 1, debitAmount: 0, creditAmount: 500000 }, // 現金
    ],
  },
  {
    transactionId: 3,
    userId: 1,
    transactionDate: '2023-04-15',
    description: '商品を800,000円で売上げ、代金は掛けとした',
    entries: [
      { entryId: 5, transactionId: 3, accountId: 2, debitAmount: 800000, creditAmount: 0 }, // 売掛金
      { entryId: 6, transactionId: 3, accountId: 7, debitAmount: 0, creditAmount: 800000 }, // 売上
    ],
  },
    {
    transactionId: 4,
    userId: 1,
    transactionDate: '2023-04-25',
    description: '従業員の給料200,000円を現金で支払った',
    entries: [
      { entryId: 7, transactionId: 4, accountId: 9, debitAmount: 200000, creditAmount: 0 }, // 給料
      { entryId: 8, transactionId: 4, accountId: 1, debitAmount: 0, creditAmount: 200000 }, // 現金
    ],
  },
  {
    transactionId: 5,
    userId: 1,
    transactionDate: '2023-04-30',
    description: '備品300,000円を現金で購入した',
    entries: [
      { entryId: 9, transactionId: 5, accountId: 10, debitAmount: 300000, creditAmount: 0 }, // 備品
      { entryId: 10, transactionId: 5, accountId: 1, debitAmount: 0, creditAmount: 300000 }, // 現金
    ],
  },
  {
    transactionId: 6,
    userId: 1,
    transactionDate: '2023-05-01',
    description: '銀行から長期資金として500,000円を借り入れた',
    entries: [
      { entryId: 11, transactionId: 6, accountId: 1, debitAmount: 500000, creditAmount: 0 }, // 現金
      { entryId: 12, transactionId: 6, accountId: 5, debitAmount: 0, creditAmount: 500000 }, // 借入金
    ],
  },
  {
    transactionId: 7,
    userId: 1,
    transactionDate: '2023-05-10',
    description: '事務用品50,000円を掛けで購入した',
    entries: [
      { entryId: 13, transactionId: 7, accountId: 11, debitAmount: 50000, creditAmount: 0 }, // 消耗品費
      { entryId: 14, transactionId: 7, accountId: 4, debitAmount: 0, creditAmount: 50000 }, // 買掛金
    ],
  },
];

// 仮の勘定科目マスタ
const accountsMaster: Account[] = [
  { id: 1, name: '現金', type: 'asset', sub_type: 'current' },
  { id: 2, name: '売掛金', type: 'asset', sub_type: 'current' },
  { id: 3, name: '商品', type: 'asset', sub_type: 'current' }, // 今回は未使用
  { id: 4, name: '買掛金', type: 'liability', sub_type: 'current' },
  { id: 5, name: '借入金', type: 'liability', sub_type: 'fixed' },
  { id: 6, name: '資本金', type: 'equity', sub_type: null },
  { id: 15, name: '利益剰余金', type: 'equity', sub_type: null },
  { id: 7, name: '売上', type: 'revenue', sub_type: null },
  { id: 8, name: '仕入', type: 'expense', sub_type: 'cogs' },
  { id: 9, name: '給料', type: 'expense', sub_type: 'sga' },
  { id: 10, name: '備品', type: 'asset', sub_type: 'fixed' },
  { id: 11, name: '消耗品費', type: 'expense', sub_type: 'sga' },
  { id: 12, name: '支払利息', type: 'expense', sub_type: 'sga' },
  { id: 13, name: '法人税等', type: 'expense', sub_type: 'tax' },
  { id: 14, name: '未払法人税等', type: 'liability', sub_type: 'current' },
];

const transactionTemplates: TransactionTemplate[] = [
    { id: 'revenue-cash', label: '現金での売上', debitAccountId: 1, creditAccountId: 7 },
    { id: 'revenue-receivable', label: '掛けでの売上', debitAccountId: 2, creditAccountId: 7 },
    { id: 'expense-cogs-cash', label: '現金での仕入', debitAccountId: 8, creditAccountId: 1 },
    { id: 'expense-cogs-payable', label: '掛けでの仕入', debitAccountId: 8, creditAccountId: 4 },
    { id: 'expense-sga-cash', label: '現金での経費支払い（販売管理費）', debitAccountId: 11, creditAccountId: 1 },
    { id: 'expense-sga-payable', label: '掛けでの経費支払い（販売管理費）', debitAccountId: 11, creditAccountId: 4 },
    { id: 'asset-purchase-cash', label: '固定資産を現金で購入', debitAccountId: 10, creditAccountId: 1 },
    { id: 'loan-repayment-cash', label: '借入金を現金で返済', debitAccountId: 5, creditAccountId: 1 },
    { id: 'financing-loan', label: '銀行からの借入', debitAccountId: 1, creditAccountId: 5 },
    { id: 'financing-capital', label: '株主からの出資', debitAccountId: 1, creditAccountId: 6 },
];


export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet>(initialBalanceSheet);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement>(initialIncomeStatement);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement>(initialCashFlowStatement);

  const calculateFinancials = (currentTransactions: Transaction[]) => {
    // --- B/S and P/L Calculation (existing logic) ---
    const bs: BalanceSheet = JSON.parse(JSON.stringify(initialBalanceSheet));
    const is: IncomeStatement = JSON.parse(JSON.stringify(initialIncomeStatement));

    currentTransactions.forEach(tx => {
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
            is.収益[account.name] = (is.収益[account.name] || 0) - amount;
            break;
          case 'expense':
            if (account.sub_type === 'cogs') is.費用.売上原価[account.name] = (is.費用.売上原価[account.name] || 0) + amount;
            else if (account.sub_type === 'sga') is.費用.販売費及び一般管理費[account.name] = (is.費用.販売費及び一般管理費[account.name] || 0) + amount;
            else if (account.sub_type === 'tax') is.費用.法人税等[account.name] = (is.費用.法人税等[account.name] || 0) + amount;
            break;
        }
      });
    });

    const totalRevenue = Object.values(is.収益).reduce((s, v) => s + v, 0);
    const totalCOGS = Object.values(is.費用.売上原価).reduce((s, v) => s + v, 0);
    const totalSGA = Object.values(is.費用.販売費及び一般管理費).reduce((s, v) => s + v, 0);
    const totalTax = Object.values(is.費用.法人税等).reduce((s, v) => s + v, 0);
    
    is.費用.費用合計 = totalCOGS + totalSGA + totalTax;
    is.当期純利益 = totalRevenue - is.費用.費用合計;
    
    // Recalculate equity based on accumulated values
    bs.assets.資産合計 = Object.values(bs.assets.流動資産).reduce((s, v) => s + v, 0) + Object.values(bs.assets.固定資産).reduce((s, v) => s + v, 0);
    bs.liabilities.負債合計 = Object.values(bs.liabilities.流動負債).reduce((s, v) => s + v, 0) + Object.values(bs.liabilities.固定負債).reduce((s, v) => s + v, 0);
    
    // 利益剰余金の計算を修正：期首の利益剰余金（今回は0と仮定）＋当期純利益
    // ※資本金の初期値は bs.equity.資本金 に入っている
    const closingRetainedEarnings = is.当期純利益;
    bs.equity.利益剰余金 += closingRetainedEarnings;

    bs.equity.純資産合計 = bs.equity.資本金 + bs.equity.利益剰余金;

    // --- Dynamic C/F Calculation (New Logic) ---
    const cf: CashFlowStatement = JSON.parse(JSON.stringify(initialCashFlowStatement));
    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;
    const cashAccountId = 1;

    currentTransactions.forEach(tx => {
        const cashEntry = tx.entries.find(e => e.accountId === cashAccountId);
        if (!cashEntry) return; // Not a cash transaction

        const cashMovement = cashEntry.debitAmount - cashEntry.creditAmount;
        
        // Find the "other side" of the transaction to classify the cash flow
        const otherEntries = tx.entries.filter(e => e.accountId !== cashAccountId);
        
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
    cf.netCashFlow = operatingActivities + investingActivities + financingActivities;
    
    // Ensure consistency with the Balance Sheet
    const endingCash = bs.assets.流動資産['現金'] || 0;
    cf.endingCashBalance = endingCash;
    // Assuming beginning balance is from the initial state, as we don't have historical periods
    cf.beginningCashBalance = initialCashFlowStatement.beginningCashBalance;
    // The net flow should align, but B/S is the source of truth for the ending balance.
    cf.netCashFlow = endingCash - cf.beginningCashBalance;


    setBalanceSheet(bs);
    setIncomeStatement(is);
    setCashFlowStatement(cf);
  };

  useEffect(() => {
    calculateFinancials(transactions);
  }, [transactions]);

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