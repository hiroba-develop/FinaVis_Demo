import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import TransactionForm from '../components/TransactionForm';
import SimpleTransactionForm from '../components/SimpleTransactionForm';

const IconLink: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-4 h-4 text-gray-400 group-hover:text-accent transition-colors ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

const IconArrowDown: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
    </svg>
);

const IconArrowUp: React.FC<{className?: string}> = ({className}) => (
     <svg className={`w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
    </svg>
);

const Dashboard: React.FC = () => {
  const { transactions, balanceSheet, incomeStatement, cashFlowStatement } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'simple' | 'journal'>('simple');
  
  const cashInBS = balanceSheet.assets.流動資産['現金'] || 0;

  // Determine if the accounting period is closed
  const retainedEarningsAccountId = 15;
  const closingTransaction = transactions.find(tx => tx.description === '決算整理仕訳（損益振替）');
  const isClosed = !!closingTransaction;

  // Get the finalized income from the closing entry if it exists
  const finalPeriodIncome = closingTransaction?.entries.find(e => e.accountId === retainedEarningsAccountId)?.creditAmount || 0;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="p-4 md:p-8">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFormOpen(!isFormOpen)}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">＋ 新規取引入力</h2>
            <svg className={`w-6 h-6 transform transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div className={`grid transition-all duration-500 ease-in-out ${isFormOpen ? 'grid-rows-[1fr] mt-6' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  <button
                    onClick={() => setFormType('simple')}
                    className={`${formType === 'simple' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    かんたん入力
                  </button>
                  <button
                    onClick={() => setFormType('journal')}
                    className={`${formType === 'journal' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    仕訳入力
                  </button>
                </nav>
              </div>

              {formType === 'simple' ? <SimpleTransactionForm /> : <TransactionForm />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">財務三表のつながり</h2>
        <div className="text-gray-600 mb-6 bg-gray-100 p-4 rounded-lg border-l-4 border-gray-300">
          <p className="mb-2">
            財務三表は独立しておらず、互いに密接に関連しています。下のカードで、特に重要な2つのつながりをハイライトしています。
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>損益計算書の<span className="font-bold text-sky-700">当期純利益</span>が、貸借対照表の<span className="font-bold text-sky-700">利益剰余金</span>として純資産に蓄積される関係。</li>
            <li>キャッシュフロー計算書の<span className="font-bold text-teal-700">期末現金残高</span>が、貸借対照表の<span className="font-bold text-teal-700">現金</span>残高と一致する関係。</li>
          </ul>
        </div>
      </div>

      <div className="space-y-8 mt-8">
        <div className="flex justify-center">
            {/* 1. Income Statement Card */}
            <Link to="/income-statement" className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl hover:shadow-xl transition-shadow duration-300 group">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">損益計算書 (P/L)</h2>
                <div className={`flex justify-between items-center font-bold text-lg p-3 rounded-md transition-colors ${isClosed ? 'bg-slate-100' : 'bg-sky-50 group-hover:bg-sky-100'}`}>
                    <div className="flex items-center gap-2">
                        {isClosed ? '期間確定利益:' : <><IconArrowDown /><span>当期純利益:</span></>}
                    </div>
                    <span className={isClosed ? 'text-slate-700' : 'text-sky-700'}>
                      {isClosed ? finalPeriodIncome.toLocaleString() : incomeStatement.当期純利益.toLocaleString()}円
                    </span>
                </div>
                {isClosed && <p className="text-xs text-center text-slate-500 mt-2">（決算整理により利益が確定しました）</p>}
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 2. Balance Sheet Card */}
            <Link to="/balance-sheet" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">貸借対照表 (B/S)</h2>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between font-semibold"><span>資産:</span><span>{balanceSheet.assets.資産合計.toLocaleString()}円</span></div>
                    <div className="flex justify-between items-center pl-4 border-l-4 border-teal-300 bg-teal-50 py-2 rounded">
                        <div className="flex items-center gap-2 font-semibold">
                            <IconLink />
                            <span>現金:</span>
                        </div>
                        <span className="font-bold">{cashInBS.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between font-semibold"><span>負債:</span><span>{balanceSheet.liabilities.負債合計.toLocaleString()}円</span></div>
                    <div className="font-semibold text-lg pt-2 mt-2 border-t">純資産: {balanceSheet.equity.純資産合計.toLocaleString()}円</div>
                    <div className="pl-4">
                        <div className="flex justify-between"><span>資本金:</span><span>{balanceSheet.equity.資本金.toLocaleString()}円</span></div>
                        <div className={`flex justify-between items-center py-1 rounded transition-colors ${!isClosed ? 'group-hover:bg-sky-100' : ''}`}>
                            <div className="flex items-center gap-2">
                                {!isClosed && <IconArrowUp />}
                                <span>利益剰余金:</span>
                            </div>
                            <span>{balanceSheet.equity.利益剰余金.toLocaleString()}円</span>
                        </div>
                        {!isClosed && (
                            <div className="text-right text-sky-700 text-sm font-semibold">
                                (+ {incomeStatement.当期純利益.toLocaleString()}円 が加算予定)
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* 3. Cash Flow Statement Card */}
            <Link to="/cash-flow-statement" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">キャッシュフロー計算書 (C/F)</h2>
                <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between"><span>営業CF:</span><span className="font-semibold">{cashFlowStatement.operatingActivities.toLocaleString()}円</span></div>
                    <div className="flex justify-between"><span>投資CF:</span><span className="font-semibold">{cashFlowStatement.investingActivities.toLocaleString()}円</span></div>
                    <div className="flex justify-between"><span>財務CF:</span><span className="font-semibold">{cashFlowStatement.financingActivities.toLocaleString()}円</span></div>
                    <div className="flex justify-between items-center font-bold text-lg bg-teal-50 p-3 rounded-md border-l-4 border-teal-300 mt-3">
                        <div className="flex items-center gap-2">
                            <IconLink />
                            <span>期末現金残高:</span>
                        </div>
                        <span className="text-teal-700">{cashFlowStatement.endingCashBalance.toLocaleString()}円</span>
                    </div>
                </div>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;