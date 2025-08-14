import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Reusable Components (assuming they are defined as in previous steps) ---
// Note: For brevity, component definitions (ReportRow, ReportBlock, ResultBox) are omitted.
// They should be present here as defined in the previous modification of this file.
interface ReportRowProps {
  label: string;
  amount: number | string;
  isSub?: boolean;
  isTotal?: boolean;
}

const ReportRow: React.FC<ReportRowProps> = ({ label, amount, isSub = false, isTotal = false }) => (
  <div className={`flex justify-between py-2 ${isSub ? 'pl-8' : ''} ${isTotal ? 'font-bold border-t' : ''}`}>
    <span>{label}</span>
    <span>{typeof amount === 'number' ? amount.toLocaleString() : amount}</span>
  </div>
);

interface ReportBlockProps {
  title: string;
  children: React.ReactNode;
  color?: string;
}

const ReportBlock: React.FC<ReportBlockProps> = ({ title, children, color = 'bg-gray-100' }) => (
  <div className={`rounded-lg shadow-sm mb-6 ${color}`}>
    <h3 className="font-semibold text-lg p-3 bg-gray-200 bg-opacity-50 rounded-t-lg">{title}</h3>
    <div className="p-4">
      {children}
    </div>
  </div>
);

interface ResultBoxProps {
    label: string;
    amount: number;
    color: string;
}
const ResultBox: React.FC<ResultBoxProps> = ({ label, amount, color }) => (
    <div className={`p-4 rounded-lg shadow-md text-white ${color}`}>
        <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold">{label}</span>
            <span className="text-xl sm:text-2xl font-extrabold">{amount.toLocaleString()}</span>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const change = data.delta;
    const value = data.type === 'total' ? data.value[1] : change;
    const isTotal = data.type === 'total';
    const sign = value >= 0 ? '+' : '';

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        <p className={`text-sm ${isTotal ? 'text-blue-600' : (change > 0 ? 'text-green-600' : 'text-red-600')}`}>
          {isTotal ? '合計: ' : '変動: '} {sign}{value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const IncomeStatement: React.FC = () => {
  const { incomeStatement, transactions, addTransaction, accountsMaster } = useTransactions();
  const navigate = useNavigate();

  // --- Calculations for Income Statement ---
  const totalRevenue = Object.values(incomeStatement.収益).reduce((s, v) => s + v, 0);
  const totalCOGS = Object.values(incomeStatement.費用.売上原価).reduce((s, v) => s + v, 0);
  const totalSGA = Object.values(incomeStatement.費用.販売費及び一般管理費).reduce((s, v) => s + v, 0);
  const totalTax = Object.values(incomeStatement.費用.法人税等).reduce((s, v) => s + v, 0);
  
  const grossProfit = totalRevenue - totalCOGS;
  const operatingIncome = grossProfit - totalSGA;
  const preTaxIncome = operatingIncome; // Simplified assumption for this app
  const finalNetIncome = incomeStatement.当期純利益; // Sourced directly from context

  const taxAccountId = 13;
  const accruedTaxAccountId = 14;
  const retainedEarningsAccountId = 15;

  const isTaxPosted = totalTax > 0;
  const isClosed = transactions.some(tx => tx.description === '決算整理仕訳（損益振替）');

  const handlePostTax = () => {
    if (isTaxPosted) {
        alert("納税額は既に計上済みです。");
        return;
    }
    const calculatedTaxForTransaction = Math.floor(preTaxIncome * 0.3);
    const taxTransaction = {
        transactionDate: new Date().toISOString().split('T')[0],
        description: '法人税等の計上',
        entries: [
            { entryId: 0, transactionId: 0, accountId: taxAccountId, debitAmount: calculatedTaxForTransaction, creditAmount: 0 },
            { entryId: 1, transactionId: 0, accountId: accruedTaxAccountId, debitAmount: 0, creditAmount: calculatedTaxForTransaction }
        ]
    };
    addTransaction(taxTransaction);
    alert('納税額を費用として計上しました。');
  };

  const handleClosingEntry = () => {
    if (isClosed) {
      alert("既に決算整理は完了しています。");
      return;
    }
    if (!isTaxPosted) {
      alert("先に納税額を費用計上してください。");
      return;
    }

    const closingEntries = [];

    // 1. Close all revenue accounts
    for (const [name, amount] of Object.entries(incomeStatement.収益)) {
      const account = accountsMaster.find(a => a.name === name && a.type === 'revenue');
      if (account) {
        closingEntries.push({ accountId: account.id, debitAmount: amount, creditAmount: 0 });
      }
    }

    // 2. Close all expense accounts
    for (const [name, amount] of Object.entries(incomeStatement.費用.売上原価)) {
       const account = accountsMaster.find(a => a.name === name && a.type === 'expense');
       if (account) {
         closingEntries.push({ accountId: account.id, debitAmount: 0, creditAmount: amount });
       }
    }
     for (const [name, amount] of Object.entries(incomeStatement.費用.販売費及び一般管理費)) {
       const account = accountsMaster.find(a => a.name === name && a.type === 'expense');
       if (account) {
         closingEntries.push({ accountId: account.id, debitAmount: 0, creditAmount: amount });
       }
    }
    // Close tax expense
    closingEntries.push({ accountId: taxAccountId, debitAmount: 0, creditAmount: totalTax });

    // 3. Transfer net income to retained earnings
    closingEntries.push({ accountId: retainedEarningsAccountId, debitAmount: 0, creditAmount: finalNetIncome });
    
    const closingTransaction = {
      transactionDate: new Date().toISOString().split('T')[0],
      description: '決算整理仕訳（損益振替）',
      entries: closingEntries.map((e, index) => ({ ...e, entryId: index, transactionId: 0 }))
    };

    addTransaction(closingTransaction);
    alert('決算整理仕訳が作成され、利益が確定しました。');
  };

  // --- Waterfall Chart Data for Income Statement ---
  const plWaterfallData = [];
  let plRunningTotal = 0;

  plWaterfallData.push({ name: '総収益', value: [0, totalRevenue], delta: totalRevenue, type: 'total' });
  plRunningTotal = totalRevenue;

  plWaterfallData.push({ name: '売上原価', value: [plRunningTotal, plRunningTotal - totalCOGS], delta: -totalCOGS, type: 'expense' });
  plRunningTotal -= totalCOGS;
  plWaterfallData.push({ name: '売上総利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });

  plWaterfallData.push({ name: '販管費', value: [plRunningTotal, plRunningTotal - totalSGA], delta: -totalSGA, type: 'expense' });
  plRunningTotal -= totalSGA;
  plWaterfallData.push({ name: '営業利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });

  plWaterfallData.push({ name: '法人税等', value: [plRunningTotal, plRunningTotal - totalTax], delta: -totalTax, type: 'expense' });
  plRunningTotal -= totalTax;
  plWaterfallData.push({ name: '当期純利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  
  const plColors = {
    expense: '#ef4444', // red
    total: '#475569'  // slate
  };


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="bg-gray-50 rounded-xl shadow-lg p-4 md:p-8">
            <div className="md:relative mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-4 md:mb-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-0 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 flex items-center text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    戻る
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">損益計算書</h1>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                <ReportBlock title="収益" color="bg-gray-100">
                   <ReportRow label="総収益" amount={totalRevenue} isTotal />
                </ReportBlock>

                <ReportBlock title="売上原価" color="bg-gray-100">
                    <ReportRow label="売上原価合計" amount={`(${totalCOGS.toLocaleString()})`} isTotal />
                </ReportBlock>

                <ResultBox label="売上総利益" amount={grossProfit} color="bg-slate-600" />
                
                <ReportBlock title="販売費及び一般管理費" color="bg-gray-100">
                     <ReportRow label="販管費合計" amount={`(${totalSGA.toLocaleString()})`} isTotal />
                </ReportBlock>
                
                <ResultBox label="営業利益" amount={operatingIncome} color="bg-sky-700" />

                {/* --- Tax Section --- */}
                <div className="border-t-2 border-dashed pt-8 mt-8">
                    <ResultBox label="税引前当期純利益" amount={preTaxIncome} color="bg-slate-600" />
                    <div className="my-6 text-center">
                        <p className="text-2xl font-bold text-gray-500">-</p>
                    </div>
                    <ReportBlock title="法人税、住民税及び事業税" color="bg-gray-100">
                        <ReportRow label={`法人税等 (税率 30%)`} amount={`(${totalTax.toLocaleString()})`} />
                    </ReportBlock>
                    <ResultBox label="当期純利益" amount={finalNetIncome} color="bg-green-600" />
                </div>

                {/* 
                <ReportBlock title="決算整理仕訳" color="bg-gray-100">
                    <ReportRow label="期首繰越利益剰余金" amount={`(${openingRetainedEarnings?.entries.find(e => e.accountId === retainedEarningsAccountId)?.creditAmount || 0})`} />
                    <ReportRow label="総収益" amount={`(${totalRevenue})`} />
                    <ReportRow label="売上原価" amount={`(${totalCOGS})`} />
                    <ReportRow label="売上総利益" amount={`(${grossProfit})`} />
                    <ReportRow label="販売費及び一般管理費" amount={`(${totalSGA})`} />
                    <ReportRow label="営業利益" amount={`(${operatingIncome})`} />
                    <ReportRow label="法人税等" amount={`(${totalTax})`} />
                    <ReportRow label="税引前当期純利益" amount={`(${preTaxIncome})`} />
                    <ReportRow label="当期純利益" amount={`(${finalNetIncome})`} />
                    <ReportRow label="期末繰越利益剰余金" amount={`(${closingRetainedEarnings?.entries.find(e => e.accountId === retainedEarningsAccountId)?.creditAmount || 0})`} />
                </ReportBlock>
                */}

                {/* --- Waterfall Chart --- */}
                <ReportBlock title="P/Lウォーターフォール図" color="bg-gray-100">
                    <div className="h-full w-full" style={{ height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={plWaterfallData} margin={{ top: 20, right: 20, left: 0, bottom: 75 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value">
                                    {plWaterfallData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={plColors[entry.type]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ReportBlock>
            </div>
        </div>
    </div>
  );
};

export default IncomeStatement;