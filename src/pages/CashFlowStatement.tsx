import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const TooltipIcon: React.FC<{ text: string }> = ({ text }) => (
    <span className="group relative ml-2 flex items-center justify-center">
        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-400 text-white text-xs font-bold cursor-pointer">
            ?
        </div>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
            <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
            </svg>
        </span>
    </span>
);

// --- Reusable Components ---
interface FlowBoxProps {
    title: string;
    amount: number;
    tooltip?: string;
}

const FlowBox: React.FC<FlowBoxProps> = ({ title, amount, tooltip }) => {
    const isPositive = amount >= 0;
    const color = isPositive ? 'bg-sky-100 border-sky-500' : 'bg-rose-100 border-rose-500';
    const textColor = isPositive ? 'text-sky-700' : 'text-rose-700';
    const formattedAmount = isPositive 
        ? amount.toLocaleString()
        : `▲ ${Math.abs(amount).toLocaleString()}`;

    return (
        <div className={`rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
             <h3 className="font-semibold text-lg text-gray-700 flex items-center mb-1">
                {title}
                {tooltip && <TooltipIcon text={tooltip} />}
            </h3>
            <p className={`text-2xl font-bold text-right ${textColor}`}>{formattedAmount}</p>
        </div>
    );
};


const BalanceInfoBox: React.FC<{ label: string; amount: number; borderColorClass: string; }> = ({ label, amount, borderColorClass }) => (
    <div className={`bg-white rounded-lg shadow p-3 border-l-4 ${borderColorClass}`}>
        <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700">{label}</span>
            <span className="font-bold text-lg text-gray-800">
                {amount.toLocaleString()}
            </span>
        </div>
    </div>
);


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.type === 'total' ? data.value[1] : data.delta;

    let valueDisplay: string;
    let valueClass = '';

    if (data.type === 'total') {
        valueDisplay = `${value.toLocaleString()}`;
        valueClass = 'text-slate-300';
    } else if (value >= 0) {
        valueDisplay = `+${value.toLocaleString()}`;
        valueClass = 'text-blue-400';
    } else {
        valueDisplay = `${value.toLocaleString()}`;
        valueClass = 'text-red-400';
    }
    
    return (
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold">{label}</p>
        <p>
            {data.type === 'total' ? '残高: ' : '変動: '}
            <span className={valueClass}>{valueDisplay}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC = () => (
    <div className="flex justify-center items-center space-x-4 md:space-x-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#475569' }}></div>
            <span>残高</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#ef4444' }}></div>
            <span>マイナス要因</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>プラス要因</span>
        </div>
    </div>
);

const CashFlowStatement: React.FC = () => {
  const { cashFlowStatement } = useTransactions();
  const navigate = useNavigate();
  const [chartMarginLeft, setChartMarginLeft] = useState(20);

  useEffect(() => {
    const handleResize = () => {
      setChartMarginLeft(window.innerWidth < 768 ? 20 : 60);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const cfWaterfallData = [];
  let cfRunningTotal = 0;

  cfWaterfallData.push({ name: '期首残高', value: [0, cashFlowStatement.beginningCashBalance], delta: cashFlowStatement.beginningCashBalance, type: 'total' });
  cfRunningTotal = cashFlowStatement.beginningCashBalance;

  cfWaterfallData.push({ name: '営業活動CF', value: [cfRunningTotal, cfRunningTotal + cashFlowStatement.operatingActivities], delta: cashFlowStatement.operatingActivities, type: 'cf' });
  cfRunningTotal += cashFlowStatement.operatingActivities;

  cfWaterfallData.push({ name: '投資活動CF', value: [cfRunningTotal, cfRunningTotal + cashFlowStatement.investingActivities], delta: cashFlowStatement.investingActivities, type: 'cf' });
  cfRunningTotal += cashFlowStatement.investingActivities;

  cfWaterfallData.push({ name: '財務活動CF', value: [cfRunningTotal, cfRunningTotal + cashFlowStatement.financingActivities], delta: cashFlowStatement.financingActivities, type: 'cf' });
  cfRunningTotal += cashFlowStatement.financingActivities;

  cfWaterfallData.push({ name: '期末残高', value: [0, cashFlowStatement.endingCashBalance], delta: cashFlowStatement.endingCashBalance, type: 'total' });


  const getNiceInterval = (maxAbs: number) => {
    if (maxAbs <= 500000) return 100000;
    if (maxAbs <= 1000000) return 250000;
    if (maxAbs <= 2000000) return 500000;
    return 1000000;
  };

  const allValues = cfWaterfallData.flatMap(d => d.value);

  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);

  const maxAbsValue = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1);
  const interval = getNiceInterval(maxAbsValue);
  
  const yMax = Math.ceil(Math.max(0, dataMax) / interval) * interval;
  const yMin = Math.floor(Math.min(0, dataMin) / interval) * interval;

  const ticks = [];
  for (let i = yMin; i <= yMax; i += interval) {
      ticks.push(i);
  }

  const colors = {
    positive_cf: '#3b82f6',   // blue-500
    negative_cf: '#ef4444',   // red-500
    total: '#475569', // slate
  };

  const yAxisFormatter = (value: number) => `${value.toLocaleString()}`;

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
            <BalanceInfoBox label="期首残高" amount={cashFlowStatement.beginningCashBalance} borderColorClass="border-slate-500" />
            <div className="space-y-4">
                <FlowBox title="営業活動CF" amount={cashFlowStatement.operatingActivities} tooltip="本業による現金の増減" />
                <FlowBox title="投資活動CF" amount={cashFlowStatement.investingActivities} tooltip="設備投資等による現金の増減" />
                <FlowBox title="財務活動CF" amount={cashFlowStatement.financingActivities} tooltip="資金調達・返済による現金の増減" />
            </div>
            <div className="border-t-2 border-dashed pt-6 space-y-4">
                 <div className="flex justify-between font-bold text-lg p-3">
                    <span>現金及び現金同等物の増減額</span>
                    <span className={cashFlowStatement.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {cashFlowStatement.netCashFlow >= 0
                            ? `${cashFlowStatement.netCashFlow.toLocaleString()}`
                            : `▲ ${Math.abs(cashFlowStatement.netCashFlow).toLocaleString()}`}
                    </span>
                </div>
                <BalanceInfoBox label="期末残高" amount={cashFlowStatement.endingCashBalance} borderColorClass="border-slate-500" />
            </div>
        </div>
      </div> {/* <-- This closing tag was missing */}

      {/* --- Bottom section for the Waterfall Chart --- */}
      <div className="relative bg-gray-50 rounded-xl shadow-lg p-4 md:p-8 mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">C/Fウォーターフォール図</h2>
        <CustomLegend />
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={cfWaterfallData} margin={{ top: 5, right: 20, left: chartMarginLeft, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={yAxisFormatter} domain={[yMin, yMax]} ticks={ticks} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} />
              <Bar dataKey="value" >
                {cfWaterfallData.map((entry, index) => {
                    let color;
                     if (entry.type === 'total') {
                        color = colors.total;
                    } else { // type is 'cf'
                        color = entry.delta >= 0 ? colors.positive_cf : colors.negative_cf;
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashFlowStatement;
