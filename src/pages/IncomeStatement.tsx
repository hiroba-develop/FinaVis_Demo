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
  borderColor?: string;
}

const ReportBlock: React.FC<ReportBlockProps> = ({ title, children, color = 'bg-white', tooltip, borderColor }) => (
    <div className={`rounded-lg shadow-sm mb-3 border ${borderColor ? `border-l-4 ${borderColor}` : 'border-gray-200'} ${color}`}>
        <h3 className="font-semibold text-lg p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center">
            {title}
            {tooltip && <TooltipIcon text={tooltip} />}
        </h3>
        <div className="p-3">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, data, totalNonOperatingRevenue, totalNonOperatingExpenses, totalExtraordinaryProfit, totalExtraordinaryLosses, totalTax }: any) => {
  if (active && payload && payload.length) {
    const currentIndex = data.findIndex((d: any) => d.name === label);
    const currentData = data[currentIndex];
    const prevData = currentIndex > 0 ? data[currentIndex - 1] : null;

    const value = currentData.type === 'total' || currentData.type === 'net_income'
        ? currentData.value[1] 
        : currentData.delta;

    let valueDisplay: string;
    let valueClass = '';
    let explanation = '';

    if (currentData.type === 'total' || currentData.type === 'net_income') {
        valueDisplay = `${value.toLocaleString()}`;
        valueClass = currentData.type === 'net_income' ? 'text-emerald-400' : 'text-blue-300';
    } else if (value >= 0) {
        valueDisplay = `+${value.toLocaleString()}`;
        valueClass = 'text-blue-400';
    } else {
        valueDisplay = `${value.toLocaleString()}`;
        valueClass = 'text-red-400';
    }

    if (prevData) {
        const prevResult = prevData.type === 'total' || prevData.type === 'net_income' ? prevData.value[1] : prevData.value[1];
        if (currentData.type === 'expense') {
            explanation = `(${prevData.name}: ${prevResult.toLocaleString()}) - (${currentData.name}: ${Math.abs(currentData.delta).toLocaleString()})`;
        } else if (currentData.type === 'revenue') {
             explanation = `(${prevData.name}: ${prevResult.toLocaleString()}) + (${currentData.name}: ${currentData.delta.toLocaleString()})`;
        }
    }

    const subExplanationItems = [
        { label: '営業外収益', value: totalNonOperatingRevenue },
        { label: '営業外費用', value: -totalNonOperatingExpenses },
        { label: '特別利益', value: totalExtraordinaryProfit },
        { label: '特別損失', value: -totalExtraordinaryLosses },
        { label: '法人税等', value: -totalTax },
    ];

    return (
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm w-64">
        <p className="font-bold text-lg mb-1">{label}</p>
        <p className="mb-2">
            <span className="font-semibold">{currentData.type.includes('total') || currentData.type.includes('net_income') ? '金額: ' : '変動額: '}</span>
            <span className={valueClass}>{valueDisplay}</span>
        </p>
        {explanation && (
            <div>
                <p className="text-xs text-gray-400 border-t border-gray-600 pt-2">計算内訳:</p>
                <p className="text-xs">{explanation}</p>
            </div>
        )}
        {label === '営業外〜税金' && (
             <div className="text-xs text-gray-300 border-t border-gray-600 pt-2 mt-2">
                <p className="text-gray-400 mb-1">内訳項目:</p>
                {subExplanationItems.filter(item => item.value !== 0).map(item => (
                    <div key={item.label} className="flex justify-between">
                        <span>{item.label}</span>
                        <span className={item.value > 0 ? 'text-blue-400' : 'text-red-400'}>
                            {item.value > 0 ? `+${item.value.toLocaleString()}` : item.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC = () => (
    <div className="flex justify-center items-center space-x-4 md:space-x-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#22c55e' }}></div>
            <span>中間合計</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#ef4444' }}></div>
            <span>マイナス要因</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>プラス要因</span>
        </div>
        <div className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#10b981' }}></div>
            <span>最終合計</span>
        </div>
    </div>
);

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
  const [waterfallView, setWaterfallView] = useState('simple');
  const [chartMarginLeft, setChartMarginLeft] = useState(20);

  useEffect(() => {
    const handleResize = () => {
      setChartMarginLeft(window.innerWidth < 768 ? 20 : 60);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const totalAllRevenue = totalRevenue + totalNonOperatingRevenue + totalExtraordinaryProfit;

  // --- Chart Data ---
  const perc = (value: number) => (totalAllRevenue > 0 ? Math.abs(value / totalAllRevenue) * 100 : 0);

  // Simple Waterfall Data
  const otherItemsDelta = finalNetIncome - operatingIncome;
  const simplePlWaterfallData = [
    { name: '売上高', value: [0, totalRevenue], delta: totalRevenue, type: 'revenue' },
    { name: '売上原価', value: [totalRevenue, grossProfit], delta: -totalCOGS, type: 'expense' },
    { name: '売上総利益', value: [0, grossProfit], delta: grossProfit, type: 'total' },
    { name: '販管費', value: [grossProfit, operatingIncome], delta: -totalSGA, type: 'expense' },
    { name: '営業利益', value: [0, operatingIncome], delta: operatingIncome, type: 'total' },
    { name: '営業外〜税金', value: [operatingIncome, finalNetIncome], delta: otherItemsDelta, type: otherItemsDelta >= 0 ? 'revenue' : 'expense' },
    { name: '当期純利益', value: [0, finalNetIncome], delta: finalNetIncome, type: 'net_income' },
  ];

  // Detailed Waterfall Data
  const detailedPlWaterfallData = [];
  let plRunningTotal = 0;

  detailedPlWaterfallData.push({ name: '総収益', value: [0, totalRevenue], delta: totalRevenue, type: 'revenue' });
  plRunningTotal = totalRevenue;
  detailedPlWaterfallData.push({ name: '売上原価', value: [plRunningTotal, plRunningTotal - totalCOGS], delta: -totalCOGS, type: 'expense' });
  plRunningTotal -= totalCOGS;
  detailedPlWaterfallData.push({ name: '売上総利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  detailedPlWaterfallData.push({ name: '販管費', value: [plRunningTotal, plRunningTotal - totalSGA], delta: -totalSGA, type: 'expense' });
  plRunningTotal -= totalSGA;
  detailedPlWaterfallData.push({ name: '営業利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  detailedPlWaterfallData.push({ name: '営業外収益', value: [plRunningTotal, plRunningTotal + totalNonOperatingRevenue], delta: totalNonOperatingRevenue, type: 'revenue' });
  plRunningTotal += totalNonOperatingRevenue;
  detailedPlWaterfallData.push({ name: '営業外費用', value: [plRunningTotal, plRunningTotal - totalNonOperatingExpenses], delta: -totalNonOperatingExpenses, type: 'expense' });
  plRunningTotal -= totalNonOperatingExpenses;
  detailedPlWaterfallData.push({ name: '経常利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  detailedPlWaterfallData.push({ name: '特別利益', value: [plRunningTotal, plRunningTotal + totalExtraordinaryProfit], delta: totalExtraordinaryProfit, type: 'revenue' });
  plRunningTotal += totalExtraordinaryProfit;
  detailedPlWaterfallData.push({ name: '特別損失', value: [plRunningTotal, plRunningTotal - totalExtraordinaryLosses], delta: -totalExtraordinaryLosses, type: 'expense' });
  plRunningTotal -= totalExtraordinaryLosses;
  detailedPlWaterfallData.push({ name: '税引前利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'total' });
  detailedPlWaterfallData.push({ name: '法人税等', value: [plRunningTotal, plRunningTotal - totalTax], delta: -totalTax, type: 'expense' });
  plRunningTotal -= totalTax;
  detailedPlWaterfallData.push({ name: '当期純利益', value: [0, plRunningTotal], delta: plRunningTotal, type: 'net_income' });
  
  const plColors = {
      revenue: '#3b82f6',     // blue-500
      expense: '#ef4444',     // red-500
      total: '#22c55e',       // green-500 (For intermediate profits)
      net_income: '#10b981'   // emerald-500
  };

  const yAxisFormatter = (value: number) => `${value.toLocaleString()}`;

  const getNiceInterval = (maxAbs: number) => {
    if (maxAbs <= 500000) return 100000;
    if (maxAbs <= 1000000) return 250000;
    if (maxAbs <= 5000000) return 500000;
    if (maxAbs <= 10000000) return 1000000;
    return 2000000;
  };
  
  const waterfallData = waterfallView === 'simple' ? simplePlWaterfallData : detailedPlWaterfallData;
  const allValues = waterfallData.flatMap(d => Array.isArray(d.value) ? d.value : [d.value]);
  
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
                    <ReportBlock title="売上高" tooltip="企業の中心的な営業活動から得られる収益" borderColor="border-sky-500">
                        {Object.entries(incomeStatement.収益).map(([key, value]) => (
                            <ReportRow key={key} label={key} amount={value} isSub />
                        ))}
                       <ReportRow label="売上高 合計" amount={totalRevenue} isTotal />
                    </ReportBlock>

                    <ReportBlock title="売上原価" tooltip="商品の仕入れや製造にかかった費用" borderColor="border-red-400">
                        {Object.entries(incomeStatement.費用.売上原価).map(([key, value]) => (
                            <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                        ))}
                       <ReportRow label="売上原価 合計" amount={`▲ ${totalCOGS.toLocaleString()}`} isTotal />
                    </ReportBlock>
                    
                    <div className="flex justify-between font-bold text-xl p-4 text-white rounded-lg shadow-inner" style={{ backgroundColor: '#008B8B' }}>
                        <span>売上総利益</span>
                        <span>{grossProfit.toLocaleString()}</span>
                    </div>

                    <ReportBlock title="販売費及び一般管理費" tooltip="販売活動や会社の一般管理業務にかかる費用" borderColor="border-red-500">
                        {Object.entries(incomeStatement.費用.販売費及び一般管理費).map(([key, value]) => (
                             <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                        ))}
                       <ReportRow label="販売費及び一般管理費 合計" amount={`▲ ${totalSGA.toLocaleString()}`} isTotal />
                    </ReportBlock>

                    <div className="flex justify-between font-bold text-xl p-4 text-white rounded-lg shadow-inner" style={{ backgroundColor: '#008B8B' }}>
                        <span>営業利益</span>
                        <span>{operatingIncome.toLocaleString()}</span>
                    </div>

                    {/* --- Ordinary Income Section --- */}
                    <div className="border-l-2 border-gray-200 space-y-2">
                        <ReportBlock title="営業外収益" tooltip="営業利益に利息収入や投資収益などを加えた、本業以外のプラス要因です" borderColor="border-sky-400">
                            {Object.entries(incomeStatement.営業外収益).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={value} isSub />
                            ))}
                             <ReportRow label="営業外収益 合計" amount={totalNonOperatingRevenue} isTotal />
                        </ReportBlock>
                        <ReportBlock title="営業外費用" tooltip="営業利益から支払利息や投資損失などを引いた、本業以外のマイナス要因です" borderColor="border-red-600">
                            {Object.entries(incomeStatement.費用.営業外費用).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                            ))}
                            <ReportRow label="営業外費用 合計" amount={`▲ ${totalNonOperatingExpenses.toLocaleString()}`} isTotal />
                        </ReportBlock>
                    </div>
                    <div className="flex justify-between font-bold text-xl p-4 text-white rounded-lg shadow-inner" style={{ backgroundColor: '#008B8B' }}>
                        <span>経常利益</span>
                        <span>{ordinaryIncome.toLocaleString()}</span>
                    </div>

                    {/* --- Pre-Tax Income Section --- */}
                     <div className="border-l-2 border-gray-200 space-y-2">
                        <ReportBlock title="特別利益" tooltip="経常利益に固定資産売却益など、臨時・特別なプラス要因を加えたものです" borderColor="border-sky-300">
                            {Object.entries(incomeStatement.特別利益).map(([key, value]) => (
                                <ReportRow key={key} label={key} amount={value} isSub />
                            ))}
                            <ReportRow label="特別利益 合計" amount={totalExtraordinaryProfit} isTotal />
                        </ReportBlock>
                        <ReportBlock title="特別損失" tooltip="経常利益から災害損失や資産除却損など、臨時・特別なマイナス要因を引いたものです" borderColor="border-red-700">
                            {Object.entries(incomeStatement.費用.特別損失).map(([key, value]) => (
                                 <ReportRow key={key} label={key} amount={`▲ ${value.toLocaleString()}`} isSub />
                            ))}
                            <ReportRow label="特別損失 合計" amount={`▲ ${totalExtraordinaryLosses.toLocaleString()}`} isTotal />
                        </ReportBlock>
                    </div>
                    <div className="flex justify-between font-bold text-xl p-4 text-white rounded-lg shadow-inner" style={{ backgroundColor: '#008B8B' }}>
                        <span>税引前当期純利益</span>
                        <span>{preTaxIncome.toLocaleString()}</span>
                    </div>
                    
                    {/* --- Net Income Section --- */}
                    <div className="border-l-2 border-gray-200 space-y-2">
                         <ReportBlock title="法人税、住民税及び事業税" borderColor="border-red-800">
                            <ReportRow label={`法人税等`} amount={`▲ ${totalTax.toLocaleString()}`} />
                        </ReportBlock>
                    </div>
                    <div className="flex justify-between font-bold text-xl p-4 text-white rounded-lg shadow-inner" style={{ backgroundColor: '#005F5F' }}>
                        <span>当期純利益</span>
                        <span>{finalNetIncome.toLocaleString()}</span>
                    </div>
                </div>

                <div className="pt-4">
                    <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-semibold text-center mb-4">
                            {chartType === 'box' ? 'P/Lボックス図' : 'P/Lウォーターフォール図'}
                        </h3>
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
                            <div>
                                <div className="flex justify-center my-4">
                                    <div className="flex rounded-md shadow-sm">
                                        <button
                                            onClick={() => setWaterfallView('simple')}
                                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${waterfallView === 'simple' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            シンプル
                                        </button>
                                        <button
                                            onClick={() => setWaterfallView('detailed')}
                                            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${waterfallView === 'detailed' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            詳細
                                        </button>
                                    </div>
                                </div>
                                <div className="h-full w-full" style={{ height: 400 }}>
                                    <CustomLegend />
                                    <ResponsiveContainer>
                                        <BarChart data={waterfallData} margin={{ top: 5, right: 20, left: chartMarginLeft, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                                    <YAxis tickFormatter={yAxisFormatter} domain={[yMin, yMax]} ticks={ticks} />
                                    <Tooltip 
                                        content={<CustomTooltip 
                                            data={waterfallData}
                                            totalNonOperatingRevenue={totalNonOperatingRevenue}
                                            totalNonOperatingExpenses={totalNonOperatingExpenses}
                                            totalExtraordinaryProfit={totalExtraordinaryProfit}
                                            totalExtraordinaryLosses={totalExtraordinaryLosses}
                                            totalTax={totalTax}
                                        />} 
                                    />
                                    <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} />
                                    <Bar dataKey="value">
                                        {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={plColors[entry.type as keyof typeof plColors]} />
                                        ))}
                                    </Bar>
                                 </BarChart>
                                </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-5xl mx-auto">
                                <p className="text-center text-sm text-gray-500 mb-6">（売上高に対する各項目の割合）</p>
                                <div className="flex flex-row" style={{ minHeight: '450px' }}>
                                    {/* Left Side: Expenses + Net Income */}
                                    <div className="w-1/2 flex flex-col" style={{ height: '400px' }}>
                                        <ChartBox label="売上原価" amount={totalCOGS} percentage={perc(totalCOGS)} color="bg-red-400" />
                                        <ChartBox label="販管費" amount={totalSGA} percentage={perc(totalSGA)} color="bg-red-500" />
                                        <ChartBox label="営業外費用" amount={totalNonOperatingExpenses} percentage={perc(totalNonOperatingExpenses)} color="bg-red-600" />
                                        <ChartBox label="特別損失" amount={totalExtraordinaryLosses} percentage={perc(totalExtraordinaryLosses)} color="bg-red-700" />
                                        <ChartBox label="法人税等" amount={totalTax} percentage={perc(totalTax)} color="bg-red-800" />
                                        <ChartBox label="当期純利益" amount={finalNetIncome} percentage={perc(finalNetIncome)} color="bg-emerald-600" />
                                    </div>
                                    {/* Right Side: Revenues */}
                                    <div className="w-1/2 flex flex-col" style={{ height: '400px' }}>
                                        <ChartBox label="売上高" amount={totalRevenue} percentage={perc(totalRevenue)} color="bg-sky-500" />
                                        <ChartBox label="営業外収益" amount={totalNonOperatingRevenue} percentage={perc(totalNonOperatingRevenue)} color="bg-sky-400" />
                                        <ChartBox label="特別利益" amount={totalExtraordinaryProfit} percentage={perc(totalExtraordinaryProfit)} color="bg-sky-300" />
                                    </div>
                                </div>
                                 <div className="flex flex-row w-full text-center mt-2 text-sm sm:text-base">
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