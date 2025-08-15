import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import TransactionForm from '../components/TransactionForm';
import SimpleTransactionForm from '../components/SimpleTransactionForm';

const formatCurrency = (amount: number) => {
    if (amount < 0) {
        return `▲ ${Math.abs(amount).toLocaleString()}`;
    }
    return `${amount.toLocaleString()}`;
};

const IconConnectionDot: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-3 h-3 ${className}`} viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" />
    </svg>
);

const IconEquals: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h14M5 14h14" />
    </svg>
);

const IconLightBulb: React.FC<{className?: string}> = ({className}) => (
    <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.7 17l4.6 0" />
    </svg>
);

const Dashboard: React.FC = () => {
  const { transactions, balanceSheet, incomeStatement, cashFlowStatement } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'simple' | 'journal'>('simple');
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  
  const cashInBS = balanceSheet.assets.流動資産['現金'] || 0;

  // --- Calculations for Income Statement ---
  const totalRevenue = Object.values(incomeStatement.収益).reduce((s, v) => s + v, 0);
  const totalCOGS = Object.values(incomeStatement.費用.売上原価).reduce((s, v) => s + v, 0);
  const grossProfit = totalRevenue - totalCOGS;

  const totalSGA = Object.values(incomeStatement.費用.販売費及び一般管理費).reduce((s, v) => s + v, 0);
  const operatingIncome = grossProfit - totalSGA;

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
          <div 
            className={`bg-gray-100 transition-all duration-300 ${isExplanationOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
          >
              <div 
                className="flex justify-between items-center cursor-pointer p-4"
                onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              >
                <div className="flex items-center gap-3">
                    <IconLightBulb className="text-yellow-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">財務三表のつながり</h2>
                </div>
                <svg className={`w-6 h-6 transform transition-transform duration-300 ${isExplanationOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className={`grid transition-all duration-500 ease-in-out ${isExplanationOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="text-gray-600 bg-gray-50 p-4 border-r border-b border-gray-200 rounded-b-lg">
                  <p className="mb-2">
                    財務三表は独立しておらず、互いに密接に関連しています。下のカードで、特に重要な2つのつながりをハイライトしています。
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>損益計算書の<span className="font-bold text-sky-700">当期純利益</span>が、貸借対照表の<span className="font-bold text-sky-700">利益剰余金</span>として純資産に蓄積される関係。</li>
                    <li>キャッシュフロー計算書の<span className="font-bold text-teal-700">期末現金残高</span>が、貸借対照表の<span className="font-bold text-teal-700">現金</span>残高と一致する関係。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        <div className="space-y-8 mt-6">
          <div className="flex justify-center">
              {/* 1. Income Statement Card */}
              <Link to="/income-statement" className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl hover:shadow-xl transition-shadow duration-300 group">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">損益計算書 (P/L)</h2>
                <div className="space-y-2">
                    <div className="flex justify-between"><span>売上高:</span><span className="font-semibold">{formatCurrency(totalRevenue)}円</span></div>
                    <div className="flex justify-between"><span>売上総利益:</span><span className="font-semibold">{formatCurrency(grossProfit)}円</span></div>
                    <div className="flex justify-between"><span>営業利益:</span><span className="font-semibold">{formatCurrency(operatingIncome)}円</span></div>
                    <div className={`flex justify-between items-center font-bold text-lg p-3 rounded-md transition-colors mt-2 ${isClosed ? 'bg-slate-100' : (isExplanationOpen ? 'bg-sky-50 group-hover:bg-sky-100' : '')}`}>
                        <div className="flex items-center gap-2">
                            {isExplanationOpen && !isClosed && <IconConnectionDot className="text-sky-500" />}
                            <span>{isClosed ? '期間確定利益:' : '当期純利益:'}</span>
                        </div>
                        <span className={isClosed ? 'text-slate-700' : (isExplanationOpen ? 'text-sky-700' : '')}>
                          {isClosed ? formatCurrency(finalPeriodIncome) : formatCurrency(incomeStatement.当期純利益)}円
                        </span>
                    </div>
                    {isClosed && <p className="text-xs text-center text-slate-500 mt-2">（決算整理により利益が確定しました）</p>}
                </div>
                 <div className="mt-6 text-center">
                    <span className="inline-block bg-accent text-white font-semibold px-6 py-2 rounded-full group-hover:bg-accent-dark transition-colors">
                        詳細を見る
                    </span>
                </div>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 2. Balance Sheet Card */}
            <Link to="/balance-sheet" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">貸借対照表 (B/S)</h2>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between font-semibold"><span>資産:</span><span>{balanceSheet.assets.資産合計.toLocaleString()}円</span></div>
                    <div className={`flex justify-between items-center pl-4 py-2 rounded transition-colors border-l-4 ${isExplanationOpen ? 'border-teal-300 bg-teal-50' : 'border-transparent'}`}>
                        <div className="flex items-center gap-2 font-semibold">
                            {isExplanationOpen && <IconEquals className="text-teal-600" />}
                            <span>現金:</span>
                        </div>
                        <span className="font-bold">{cashInBS.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between font-semibold"><span>負債:</span><span>{balanceSheet.liabilities.負債合計.toLocaleString()}円</span></div>
                    <div className="font-semibold text-lg pt-2 mt-2 border-t">純資産: {balanceSheet.equity.純資産合計.toLocaleString()}円</div>
                    <div className="pl-4">
                        <div className="flex justify-between"><span>資本金:</span><span>{balanceSheet.equity.資本金.toLocaleString()}円</span></div>
                        <div
                          className={[
                            'flex justify-between items-center py-1 rounded transition-colors',
                            !isClosed && isExplanationOpen ? 'bg-sky-50' : '',
                            !isClosed ? 'group-hover:bg-sky-100' : ''
                          ].filter(Boolean).join(' ')}
                        >
                            <div className="flex items-center gap-2">
                                {isExplanationOpen && !isClosed && <IconConnectionDot className="text-sky-500" />}
                                <span>利益剰余金:</span>
                            </div>
                            <span>{formatCurrency(balanceSheet.equity.利益剰余金)}円</span>
                        </div>
                        {!isClosed && (
                            <div className="text-right text-sky-700 text-sm font-semibold">
                                (+ {formatCurrency(incomeStatement.当期純利益)}円 が加算予定)
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <span className="inline-block bg-accent text-white font-semibold px-6 py-2 rounded-full group-hover:bg-accent-dark transition-colors">
                        詳細を見る
                    </span>
                </div>
            </Link>

            {/* 3. Cash Flow Statement Card */}
            <Link to="/cash-flow-statement" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-accent mb-4 text-center">キャッシュフロー計算書 (C/F)</h2>
                <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between"><span>営業CF:</span><span className="font-semibold">{formatCurrency(cashFlowStatement.operatingActivities)}円</span></div>
                    <div className="flex justify-between"><span>投資CF:</span><span className="font-semibold">{formatCurrency(cashFlowStatement.investingActivities)}円</span></div>
                    <div className="flex justify-between"><span>財務CF:</span><span className="font-semibold">{formatCurrency(cashFlowStatement.financingActivities)}円</span></div>
                    <div className={`flex justify-between items-center font-bold text-lg p-3 rounded-md mt-3 transition-colors border-l-4 ${isExplanationOpen ? 'bg-teal-50 border-teal-300' : 'border-transparent'}`}>
                        <div className="flex items-center gap-2">
                            {isExplanationOpen && <IconEquals className="text-teal-600" />}
                            <span>期末現金残高:</span>
                        </div>
                        <span className={isExplanationOpen ? 'text-teal-700' : ''}>{cashFlowStatement.endingCashBalance.toLocaleString()}円</span>
                    </div>
                </div>
                 <div className="mt-6 text-center">
                    <span className="inline-block bg-accent text-white font-semibold px-6 py-2 rounded-full hover:bg-accent-dark transition-colors">
                        詳細を見る
                    </span>
                </div>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;