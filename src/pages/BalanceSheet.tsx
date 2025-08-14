import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';

const Section: React.FC<{ title: string; amount: number; color: string; children: React.ReactNode }> = ({ title, amount, color, children }) => (
  <div className={`rounded-lg shadow-md p-4 mb-6 bg-white border-l-4 ${color}`}>
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-lg text-gray-700">{title}</h3>
      <span className="font-bold text-lg text-gray-800">{amount.toLocaleString()}</span>
    </div>
    <div className="pl-4 space-y-2">
      {children}
    </div>
  </div>
);

const AccountRow: React.FC<{ name: string; value: number }> = ({ name, value }) => (
  <div className="flex justify-between text-gray-600">
    <span>{name}</span>
    <span>{value.toLocaleString()}</span>
  </div>
);

const ChartBox: React.FC<{ label: string; amount: number; percentage: number; color: string; }> = ({ label, amount, percentage, color }) => {
    if (percentage === 0) return null;

    // Define a threshold for when the default text inside the box is readable.
    const isTextReadable = percentage >= 10;

    return (
        <div 
            className={`relative group flex flex-col justify-center items-center p-2 text-white shadow-inner ${color}`}
            style={{ height: `${percentage}%` }}
        >
            {/* Default text, visible only if the box is large enough */}
            <div className={`text-center transition-opacity duration-300 ${isTextReadable ? 'opacity-100' : 'opacity-0'}`}>
                <div className="font-bold text-sm sm:text-lg truncate">{label}</div>
                <div className="text-xs sm:text-sm font-semibold">{amount.toLocaleString()}</div>
                <div className="text-xs opacity-80">({percentage.toFixed(1)}%)</div>
            </div>

            {/* Custom Tooltip (吹き出し) that appears on hover for ALL items */}
            <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"
            >
                <p className="font-bold text-base">{label}</p>
                <p>{amount.toLocaleString()}円 ({percentage.toFixed(1)}%)</p>
                {/* Speech bubble arrow */}
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};


const BalanceSheet: React.FC = () => {
  const { balanceSheet } = useTransactions();
  const navigate = useNavigate();

  const totalCurrentAssets = Object.values(balanceSheet.assets.流動資産).reduce((s, v) => s + v, 0);
  const totalFixedAssets = Object.values(balanceSheet.assets.固定資産).reduce((s, v) => s + v, 0);
  const totalCurrentLiabilities = Object.values(balanceSheet.liabilities.流動負債).reduce((s, v) => s + v, 0);
  const totalFixedLiabilities = Object.values(balanceSheet.liabilities.固定負債).reduce((s, v) => s + v, 0);
  const totalAssets = balanceSheet.assets.資産合計;

  const perc = (value: number) => (totalAssets > 0 ? (value / totalAssets) * 100 : 0);

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">貸借対照表</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 資産の部 */}
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center text-accent border-b-2 border-accent pb-3">資産の部</h2>
                    <Section title="流動資産" amount={totalCurrentAssets} color="border-cyan-500">
                        {Object.entries(balanceSheet.assets.流動資産).map(([key, value]) => (
                           <AccountRow key={key} name={key} value={value} />
                        ))}
                    </Section>
                    <Section title="固定資産" amount={totalFixedAssets} color="border-sky-700">
                         {Object.entries(balanceSheet.assets.固定資産).map(([key, value]) => (
                           <AccountRow key={key} name={key} value={value} />
                        ))}
                    </Section>
                    <div className="flex justify-between font-bold text-xl p-4 bg-white rounded-lg shadow-inner">
                        <span>資産合計</span>
                        <span>{balanceSheet.assets.資産合計.toLocaleString()}</span>
                    </div>
                </div>

                {/* 負債・純資産の部 */}
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center text-accent border-b-2 border-accent pb-3">負債・純資産の部</h2>
                    <Section title="流動負債" amount={totalCurrentLiabilities} color="border-amber-500">
                        {Object.entries(balanceSheet.liabilities.流動負債).map(([key, value]) => (
                            <AccountRow key={key} name={key} value={value} />
                        ))}
                    </Section>
                    <Section title="固定負債" amount={totalFixedLiabilities} color="border-orange-700">
                        {Object.entries(balanceSheet.liabilities.固定負債).map(([key, value]) => (
                            <AccountRow key={key} name={key} value={value} />
                        ))}
                    </Section>
                     <div className="flex justify-between font-bold text-lg p-3 bg-gray-200 rounded-lg">
                        <span>負債合計</span>
                        <span>{balanceSheet.liabilities.負債合計.toLocaleString()}</span>
                    </div>

                    <Section title="純資産" amount={balanceSheet.equity.純資産合計} color="border-teal-500">
                         <AccountRow name="資本金" value={balanceSheet.equity.資本金} />
                         <AccountRow name="利益剰余金" value={balanceSheet.equity.利益剰余金} />
                    </Section>

                    <div className="flex justify-between font-bold text-xl p-4 bg-white rounded-lg shadow-inner">
                        <span>負債・純資産合計</span>
                        <span>{(balanceSheet.liabilities.負債合計 + balanceSheet.equity.純資産合計).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>

      <div className="relative bg-gray-50 rounded-xl shadow-lg p-4 md:p-8 mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">B/Sボックス図</h2>
        
        {/* We apply overflow-visible to the columns to allow tooltips to escape */}
        <div className="w-full max-w-4xl mx-auto flex" style={{ height: '400px' }}>
            {/* Assets Side */}
            <div className="w-1/2 flex flex-col overflow-visible">
                <ChartBox label="流動資産" amount={totalCurrentAssets} percentage={perc(totalCurrentAssets)} color="bg-cyan-500" />
                <ChartBox label="固定資産" amount={totalFixedAssets} percentage={perc(totalFixedAssets)} color="bg-sky-700" />
            </div>
            
            {/* Liabilities & Equity Side */}
            <div className="w-1/2 flex flex-col overflow-visible">
                <ChartBox label="流動負債" amount={totalCurrentLiabilities} percentage={perc(totalCurrentLiabilities)} color="bg-amber-500" />
                <ChartBox label="固定負債" amount={totalFixedLiabilities} percentage={perc(totalFixedLiabilities)} color="bg-orange-700" />
                <ChartBox label="純資産" amount={balanceSheet.equity.純資産合計} percentage={perc(balanceSheet.equity.純資産合計)} color="bg-teal-600" />
            </div>
        </div>
        <div className="flex w-full max-w-4xl mx-auto text-center mt-2 text-sm sm:text-base">
            <div className="w-1/2 font-bold text-gray-700 p-2 border-t-2">資産合計: {totalAssets.toLocaleString()}</div>
            <div className="w-1/2 font-bold text-gray-700 p-2 border-t-2">負債・純資産合計: {(balanceSheet.liabilities.負債合計 + balanceSheet.equity.純資産合計).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;