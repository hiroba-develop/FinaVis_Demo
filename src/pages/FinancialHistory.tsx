import React, { useState } from 'react';
import { useHistory, type HistoricalData } from '../contexts/HistoryContext';
import { Link, useNavigate } from 'react-router-dom';

const formatCurrency = (amount: number) => {
    if (amount < 0) {
        return `▲ ${Math.abs(amount).toLocaleString()}`;
    }
    return `${amount.toLocaleString()}`;
};

const FinancialHistory: React.FC = () => {
    const { history } = useHistory();
    const navigate = useNavigate();

    if (history.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">財務履歴</h1>
                <p className="text-gray-600">まだ履歴データがありません。</p>
                <p className="mt-2">ダッシュボードから「決算を締める」を実行すると、ここに履歴が記録されます。</p>
                 <Link to="/" className="mt-6 inline-block bg-accent text-white font-semibold px-6 py-2 rounded-full hover:bg-accent-dark transition-colors">
                    ダッシュボードに戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">財務履歴</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会計期間</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">当期純利益</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">総資産</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">期末現金残高</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">各計算書へのリンク</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.map((periodData, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{periodData.periodString}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(periodData.incomeStatement.当期純利益)}円</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(periodData.balanceSheet.assets.資産合計)}円</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(periodData.cashFlowStatement.endingCashBalance)}円</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                                    <Link to={`/income-statement/${index}`} className="text-accent hover:text-accent-dark font-semibold">P/L</Link>
                                    <Link to={`/balance-sheet/${index}`} className="text-accent hover:text-accent-dark font-semibold">B/S</Link>
                                    <Link to={`/cash-flow-statement/${index}`} className="text-accent hover:text-accent-dark font-semibold">C/F</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialHistory;
