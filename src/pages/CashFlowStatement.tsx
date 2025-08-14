import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import type { CashFlowStatement} from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Reusable Components ---
interface FlowBoxProps {
    title: string;
    amount: number;
}
const FlowBox: React.FC<FlowBoxProps> = ({ title, amount }) => {
    const isPositive = amount >= 0;
    const color = isPositive ? 'bg-sky-100 border-sky-500' : 'bg-rose-100 border-rose-500';
    const textColor = isPositive ? 'text-sky-700' : 'text-rose-700';
    const sign = isPositive ? '+' : '-';

    return (
        <div className={`rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
            <h3 className="font-semibold text-lg text-gray-700">{title}</h3>
            <p className={`text-2xl font-bold text-right ${textColor}`}>{sign} {Math.abs(amount).toLocaleString()}</p>
        </div>
    );
};

const BalanceBox: React.FC<{label: string, amount: number}> = ({label, amount}) => (
    <div className="bg-gray-200 rounded-lg p-4 shadow-inner">
        <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-700">{label}</span>
            <span className="text-xl font-bold text-gray-800">{amount.toLocaleString()}</span>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const change = data.delta;
    const value = data.type === 'total' ? data.value[1] : change;
    const isTotal = data.type === 'total';
    const sign = value >= 0 ? '+' : '-';

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        <p className={`text-sm ${isTotal ? 'text-slate-600' : (value >= 0 ? 'text-green-600' : 'text-red-600')}`}>
          {isTotal ? '残高: ' : '変動: '} {sign}{Math.abs(value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CashFlowStatement: React.FC = () => {
  const { cashFlowStatement } = useTransactions();
  const navigate = useNavigate();
  
  // --- Waterfall Chart Data ---
  const waterfallData = [];
  let runningTotal = 0;

  const beginningBalance = cashFlowStatement.beginningCashBalance;
  waterfallData.push({ name: '期首残高', value: [0, beginningBalance], delta: beginningBalance, type: 'total' });
  runningTotal = beginningBalance;

  const opCF = cashFlowStatement.operatingActivities;
  waterfallData.push({ name: '営業CF', value: opCF >= 0 ? [runningTotal, runningTotal + opCF] : [runningTotal + opCF, runningTotal], delta: opCF, type: 'op' });
  runningTotal += opCF;

  const invCF = cashFlowStatement.investingActivities;
  waterfallData.push({ name: '投資CF', value: invCF >= 0 ? [runningTotal, runningTotal + invCF] : [runningTotal + invCF, runningTotal], delta: invCF, type: 'inv' });
  runningTotal += invCF;

  const finCF = cashFlowStatement.financingActivities;
  waterfallData.push({ name: '財務CF', value: finCF >= 0 ? [runningTotal, runningTotal + finCF] : [runningTotal + finCF, runningTotal], delta: finCF, type: 'fin' });
  runningTotal += finCF; // <-- This was the missing line
  
  // The final runningTotal should now correctly match the endingBalance.
  // We use the pre-calculated endingBalance from the context to ensure consistency.
  const endingBalance = cashFlowStatement.endingCashBalance;
  waterfallData.push({ name: '期末残高', value: [0, endingBalance], delta: endingBalance, type: 'total' });

  const colors = {
    op: '#3b82f6',    // 青系
    inv: '#22c55e',   // 緑系
    fin: '#ef4444',   // 赤系
    total: '#475569' // Slate
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      {/* --- Top section for the C/F report boxes --- */}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">キャッシュフロー計算書</h1>
        </div>
        
        <div className="max-w-xl mx-auto space-y-6">
            <BalanceBox label="期首残高" amount={cashFlowStatement.beginningCashBalance} />
            <div className="space-y-4">
                <FlowBox title="営業活動によるCF" amount={cashFlowStatement.operatingActivities} />
                <FlowBox title="投資活動によるCF" amount={cashFlowStatement.investingActivities} />
                <FlowBox title="財務活動によるCF" amount={cashFlowStatement.financingActivities} />
            </div>
            <div className="border-t-2 border-dashed pt-6 space-y-4">
                 <div className="flex justify-between font-bold text-lg p-3">
                    <span>現金及び現金同等物の増減額</span>
                    <span className={cashFlowStatement.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {cashFlowStatement.netCashFlow.toLocaleString()}
                    </span>
                </div>
                <BalanceBox label="期末残高" amount={cashFlowStatement.endingCashBalance} />
            </div>
        </div>
      </div> {/* <-- This closing tag was missing */}

      {/* --- Bottom section for the Waterfall Chart --- */}
      <div className="relative bg-gray-50 rounded-xl shadow-lg p-4 md:p-8 mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">C/Fウォーターフォール図</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={waterfallData} margin={{ top: 20, right: 20, left: 0, bottom: 75 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.type as keyof typeof colors]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashFlowStatement;
