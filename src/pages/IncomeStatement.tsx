import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

interface ReportRowProps {
  label: string;
  amount: number | string;
  isSub?: boolean;
  isTotal?: boolean;
}

const ReportRow: React.FC<ReportRowProps> = ({ label, amount, isSub = false, isTotal = false }) => (
  <div className={`flex justify-between py-1 ${isSub ? 'pl-8' : ''} ${isTotal ? 'font-bold border-t' : ''}`}>
    <span>{label}</span>
    <span>{typeof amount === 'number' ? amount.toLocaleString() : amount}</span>
  </div>
);

interface ReportBlockProps {
  title: string;
  children: React.ReactNode;
  color?: string;
  tooltip?: string;
}

const ReportBlock: React.FC<ReportBlockProps> = ({ title, children, color = 'bg-white', tooltip }) => (
    <div className={`rounded-lg shadow-sm mb-3 border border-gray-200 ${color}`}>
        <h3 className="font-semibold text-lg p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center">
            {title}
            {tooltip && <TooltipIcon text={tooltip} />}
        </h3>
        <div className="p-3">
      {children}
    </div>
  </div>
);

interface ResultBoxProps {
    label: string;
    amount: number;
    color: string;
    tooltip?: string;
}
const ResultBox: React.FC<ResultBoxProps> = ({ label, amount, color, tooltip }) => (
    <div className={`p-3 rounded-lg shadow-md text-white ${color}`}>
        <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold flex items-center">
                {label}
                {tooltip && <TooltipIcon text={tooltip} />}
            </span>
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
        <p className={`text-sm ${isTotal ? 'text-blue-600' : (change >= 0 ? 'text-green-600' : 'text-red-600')}`}>
          {isTotal ? '合計: ' : '変動: '} {sign}{value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const ChartBox: React.FC<{ label: string; amount: number; percentage: number; color: string; }> = ({ label, amount, percentage, color }) => {
    if (percentage === 0) return null;
    const isTextReadable = percentage >= 10;
    return (
        <div 
            className={`relative group flex flex-col justify-center items-center p-2 text-white shadow-inner ${color}`}
            style={{ height: `${percentage}%` }}
        >
            <div className={`text-center transition-opacity duration-300 ${isTextReadable ? 'opacity-100' : 'opacity-0'}`}>
                <div className="font-bold text-sm sm:text-lg truncate">{label}</div>
                <div className="text-xs sm:text-sm font-semibold">{amount.toLocaleString()}</div>
                <div className="text-xs opacity-80">({percentage.toFixed(1)}%)</div>
            </div>
            <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"
            >
                <p className="font-bold text-base">{label}</p>
                <p>{amount.toLocaleString()}円 ({percentage.toFixed(1)}%)</p>
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};

const IncomeStatement: React.FC = () => {
  const { incomeStatement } = useTransactions();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('box');

  // --- Calculations for Income Statement ---
  const totalRevenue = Object.values(incomeStatement.収益).reduce((s, v) => s + v, 0);
  const totalCOGS = Object.values(incomeStatement.費用.売上原価).reduce((s, v) => s + v, 0);
  const grossProfit = totalRevenue - totalCOGS;

  const totalSGA = Object.values(incomeStatement.費用.販売費及び一般管理費).reduce((s, v) => s + v, 0);
  const operatingIncome = grossProfit - totalSGA;

  const totalNonOperatingRevenue = Object.values(incomeStatement.営業外収益).reduce((s, v) => s + v, 0);
  const totalNonOperatingExpenses = Object.values(incomeStatement.費用.営業外費用).reduce((s, v) => s + v, 0);
  const ordinaryIncome = operatingIncome + totalNonOperatingRevenue - totalNonOperatingExpenses;

  const totalExtraordinaryProfit = Object.values(incomeStatement.特別利益).reduce((s, v) => s + v, 0);
  const totalExtraordinaryLosses = Object.values(incomeStatement.費用.特別損失).reduce((s, v) => s + v, 0);
  const preTaxIncome = ordinaryIncome + totalExtraordinaryProfit - totalExtraordinaryLosses;

  const totalTax = Object.values(incomeStatement.費用.法人税等).reduce((s, v) => s + v, 0);
  const finalNetIncome = preTaxIncome - totalTax;

  // --- Chart Data ---
  const perc = (value: number) => (totalRevenue > 0 ? Math.abs(value / totalRevenue) * 100 : 0);

  const plWaterfallData = [];
  let plRunningTotal = 0;

  plWaterfallData.push({ name: '総収益', value: [0, totalRevenue], delta: totalRevenue, type: 'revenue' });
  plRunningTotal = totalRevenue;
  plWaterfallData.push({ name: '売上原価', value: [plRunningTotal, plRunningTotal - totalCOGS], delta: -totalCOGS, type: 'expense' });
  plRunningTotal -= totalCOGS;
  plWaterfallData.push({ name: '売上総利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  plWaterfallData.push({ name: '販管費', value: [plRunningTotal, plRunningTotal - totalSGA], delta: -totalSGA, type: 'expense' });
  plRunningTotal -= totalSGA;
  plWaterfallData.push({ name: '営業利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  plWaterfallData.push({ name: '営業外収益', value: [plRunningTotal, plRunningTotal + totalNonOperatingRevenue], delta: totalNonOperatingRevenue, type: 'revenue' });
  plRunningTotal += totalNonOperatingRevenue;
  plWaterfallData.push({ name: '営業外費用', value: [plRunningTotal, plRunningTotal - totalNonOperatingExpenses], delta: -totalNonOperatingExpenses, type: 'expense' });
  plRunningTotal -= totalNonOperatingExpenses;
  plWaterfallData.push({ name: '経常利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  plWaterfallData.push({ name: '特別利益', value: [plRunningTotal, plRunningTotal + totalExtraordinaryProfit], delta: totalExtraordinaryProfit, type: 'revenue' });
  plRunningTotal += totalExtraordinaryProfit;
  plWaterfallData.push({ name: '特別損失', value: [plRunningTotal, plRunningTotal - totalExtraordinaryLosses], delta: -totalExtraordinaryLosses, type: 'expense' });
  plRunningTotal -= totalExtraordinaryLosses;
  plWaterfallData.push({ name: '税引前利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  plWaterfallData.push({ name: '法人税等', value: [plRunningTotal, plRunningTotal - totalTax], delta: -totalTax, type: 'expense' });
  plRunningTotal -= totalTax;
  plWaterfallData.push({ name: '当期純利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  
  const plColors = {
      revenue: '#22c55e',
      expense: '#ef4444',
      total: '#475569'
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

            <div className="max-w-3xl mx-auto space-y-2">
                <div className="space-y-2">
                    <ReportBlock title="売上総利益" tooltip="粗利益とも呼ばれ、商品の付加価値を示す基本的な利益です">
                       <ReportRow label="売上高" amount={totalRevenue} />
                       <ReportRow label="売上原価" amount={`▲ ${totalCOGS.toLocaleString()}`} />
                       <ReportRow label="売上総利益" amount={grossProfit} isTotal />
                    </ReportBlock>

                    <ReportBlock title="営業利益" tooltip="売上総利益から販管費を引いた、本業による利益です">
                       <ReportRow label="販売費及び一般管理費" amount={`▲ ${totalSGA.toLocaleString()}`} />
                       <ReportRow label="営業利益" amount={operatingIncome} isTotal />
                    </ReportBlock>

                    {/* --- Ordinary Income Section --- */}
                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                        <ReportBlock title="営業外収益" tooltip="営業利益に利息収入や投資収益などを加えた、本業以外のプラス要因です">
                            {Object.entries(incomeStatement.営業外収益).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={value} isSub />
                            ))}
                             <ReportRow label="営業外収益 合計" amount={totalNonOperatingRevenue} isTotal />
                        </ReportBlock>
                        <ReportBlock title="営業外費用" tooltip="営業利益から支払利息や投資損失などを引いた、本業以外のマイナス要因です">
                            {Object.entries(incomeStatement.費用.営業外費用).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                            ))}
                            <ReportRow label="営業外費用 合計" amount={`▲ ${totalNonOperatingExpenses.toLocaleString()}`} isTotal />
                        </ReportBlock>
                    </div>
                    <ResultBox label="経常利益" amount={ordinaryIncome} color="bg-sky-700" tooltip="営業利益に利息収入などを加減した、通常の事業活動による利益です" />

                    {/* --- Pre-Tax Income Section --- */}
                     <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                        <ReportBlock title="特別利益" tooltip="経常利益に固定資産売却益など、臨時・特別なプラス要因を加えたものです">
                            {Object.entries(incomeStatement.特別利益).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={value} isSub />
                            ))}
                            <ReportRow label="特別利益 合計" amount={totalExtraordinaryProfit} isTotal />
                        </ReportBlock>
                        <ReportBlock title="特別損失" tooltip="経常利益から災害損失や資産除却損など、臨時・特別なマイナス要因を引いたものです">
                            {Object.entries(incomeStatement.費用.特別損失).map(([key, value]) => (
                                 <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                            ))}
                            <ReportRow label="特別損失 合計" amount={`▲ ${totalExtraordinaryLosses.toLocaleString()}`} isTotal />
                        </ReportBlock>
                    </div>
                    <ResultBox label="税引前当期純利益" amount={preTaxIncome} color="bg-indigo-700" tooltip="特別損益も含めた、すべての活動による税引前の利益です" />
                    
                    {/* --- Net Income Section --- */}
                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                         <ReportBlock title="法人税、住民税及び事業税">
                            <ReportRow label={`法人税等`} amount={`▲ ${totalTax.toLocaleString()}`} />
                        </ReportBlock>
                    </div>
                    <ResultBox label="当期純利益" amount={finalNetIncome} color="bg-emerald-600" tooltip="会社が1年間で稼いだ最終的な利益。配当や内部留保の源泉です" />
                </div>

                <div className="pt-4">
                    <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-semibold text-center mb-4">PLチャート</h3>
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => setChartType('box')}
                                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${chartType === 'box' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                ボックス図
                            </button>
                            <button
                                onClick={() => setChartType('waterfall')}
                                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${chartType === 'waterfall' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                ウォーターフォール図
                            </button>
                        </div>
                        {chartType === 'waterfall' ? (
                            <div className="h-full w-full" style={{ height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart data={plWaterfallData} margin={{ top: 20, right: 20, left: 0, bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-60} textAnchor="end" height={120} interval={0} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value">
                                    {plWaterfallData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={plColors[entry.type as keyof typeof plColors]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                        ) : (
                            <div className="w-full max-w-2xl mx-auto">
                                <div className="flex" style={{ height: '500px' }}>
                                    <div className="w-1/2 flex flex-col">
                                        <ChartBox label="売上原価" amount={totalCOGS} percentage={perc(totalCOGS)} color="bg-slate-400" />
                                        <ChartBox label="販管費" amount={totalSGA} percentage={perc(totalSGA)} color="bg-slate-500" />
                                        <ChartBox label="営業外費用" amount={totalNonOperatingExpenses} percentage={perc(totalNonOperatingExpenses)} color="bg-slate-500" />
                                        <ChartBox label="特別損失" amount={totalExtraordinaryLosses} percentage={perc(totalExtraordinaryLosses)} color="bg-slate-600" />
                                        <ChartBox label="法人税等" amount={totalTax} percentage={perc(totalTax)} color="bg-slate-600" />
                                        <ChartBox label="当期純利益" amount={finalNetIncome} percentage={perc(finalNetIncome)} color="bg-emerald-500" />
                                    </div>
                                    <div className="w-1/2 flex flex-col">
                                        <ChartBox label="総収益" amount={totalRevenue} percentage={perc(totalRevenue)} color="bg-cyan-500" />
                                        <ChartBox label="営業外収益" amount={totalNonOperatingRevenue} percentage={perc(totalNonOperatingRevenue)} color="bg-cyan-400" />
                                        <ChartBox label="特別利益" amount={totalExtraordinaryProfit} percentage={perc(totalExtraordinaryProfit)} color="bg-cyan-300" />
                                    </div>
                                </div>
                                <div className="flex w-full text-center mt-2 text-sm sm:text-base">
                                    <div className="w-1/2 font-bold text-gray-700 p-2 border-t-2">費用・利益合計: {(totalCOGS + totalSGA + totalNonOperatingExpenses + totalExtraordinaryLosses + totalTax + finalNetIncome).toLocaleString()}</div>
                                    <div className="w-1/2 font-bold text-gray-700 p-2 border-t-2">収益合計: {(totalRevenue + totalNonOperatingRevenue + totalExtraordinaryProfit).toLocaleString()}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IncomeStatement;