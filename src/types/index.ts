// ユーザー関連の型定義
export interface User {
  id: number;
  username: string;
  role: 'teacher' | 'student';
}

// 勘定科目マスタの型定義
export interface Account {
  id: number;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  sub_type: 'current' | 'fixed' | 'cogs' | 'sga' | 'tax' | 
            'non-operating-expense' | 'extraordinary-loss' | 
            'non-operating-revenue' | 'extraordinary-profit' | null;
}

// 仕訳の型定義
export interface JournalEntry {
  entryId: number;
  transactionId: number;
  accountId: number;
  debitAmount: number;
  creditAmount: number;
}

// 取引の型定義
export interface Transaction {
  transactionId: number;
  userId: number;
  transactionDate: string;
  description: string;
  entries: JournalEntry[];
}

// 簡易入力用の取引データ型
export interface SimpleTransaction {
  templateId: string;
  transactionDate: string;
  amount: number;
  description: string;
}

// 取引テンプレートの型定義
export interface TransactionTemplate {
  id: string;
  label: string;
  debitAccountId: number;
  creditAccountId: number;
}


// 貸借対照表の型定義
export interface BalanceSheet {
  assets: {
    流動資産: { [key: string]: number };
    固定資産: { [key: string]: number };
    資産合計: number;
  };
  liabilities: {
    流動負債: { [key: string]: number };
    固定負債: { [key: string]: number };
    負債合計: number;
  };
  equity: {
    資本金: number;
    利益剰余金: number;
    純資産合計: number;
  };
}

// 損益計算書の型定義
export interface IncomeStatement {
  収益: { [key: string]: number };
  費用: {
    売上原価: { [key: string]: number };
    販売費及び一般管理費: { [key: string]: number };
    営業外費用: { [key: string]: number };
    特別損失: { [key: string]: number };
    法人税等: { [key: string]: number };
    費用合計: number;
  };
  営業外収益: { [key: string]: number };
  特別利益: { [key: string]: number };
  当期純利益: number;
}

// キャッシュフロー計算書の型定義
export interface CashFlowStatement {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
}