import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import type { JournalEntry } from '../types';

const TransactionHistory: React.FC = () => {
  const { transactions, accountsMaster } = useTransactions();
  const [openTxId, setOpenTxId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const getAccountName = (id: number) => {
    return accountsMaster.find(acc => acc.id === id)?.name || '不明な勘定';
  };
  
  const getSimpleEntryInfo = (entries: JournalEntry[]) => {
    const debits = entries.filter(e => e.debitAmount > 0);
    const credits = entries.filter(e => e.creditAmount > 0);
    const totalAmount = debits.reduce((sum, e) => sum + e.debitAmount, 0);

    if (debits.length === 1 && credits.length === 1) {
        return {
            debitAccount: getAccountName(debits[0].accountId),
            creditAccount: getAccountName(credits[0].accountId),
            amount: totalAmount,
        };
    }
    return {
        debitAccount: '諸口',
        creditAccount: '諸口',
        amount: totalAmount,
    };
  };

  const handleRowClick = (txId: number) => {
    setOpenTxId(openTxId === txId ? null : txId);
  };

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(tx => tx.transactionDate.substring(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
        const yearMatch = !selectedYear || tx.transactionDate.startsWith(selectedYear);
        const monthMatch = !selectedMonth || tx.transactionDate.substring(5, 7) === selectedMonth;
        const termMatch = !searchTerm || tx.description.toLowerCase().includes(searchTerm.toLowerCase());
        return yearMatch && monthMatch && termMatch;
    });
  }, [transactions, searchTerm, selectedYear, selectedMonth]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};
    filteredTransactions.forEach(tx => {
        const month = tx.transactionDate.substring(0, 7); // YYYY-MM
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])); // Sort by month descending
  }, [filteredTransactions]);

  const paginatedMonths = useMemo(() => {
    if (selectedYear || selectedMonth || searchTerm) {
        return groupedTransactions;
    }
    return groupedTransactions.length > 0 ? [groupedTransactions[currentPage]] : [];
  }, [groupedTransactions, currentPage, selectedYear, selectedMonth, searchTerm]);


  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedMonth('');
    setCurrentPage(0);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">取引履歴</h1>

        {/* --- Filter Section --- */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">キーワード</label>
                    <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="取引内容で検索..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">年</label>
                    <select
                        id="year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    >
                        <option value="">すべて</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">月</label>
                    <select
                        id="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    >
                        <option value="">すべて</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}月</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-start-4">
                     <button
                        onClick={handleResetFilters}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                        リセット
                    </button>
                </div>
            </div>
        </div>
        
        {/* --- Pagination --- */}
        {!(selectedYear || selectedMonth || searchTerm) && groupedTransactions.length > 1 && (
            <div className="flex justify-between items-center mt-6 mb-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    前月
                </button>
                <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    最新
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(groupedTransactions.length - 1, prev + 1))}
                    disabled={currentPage === groupedTransactions.length - 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    次月
                </button>
            </div>
        )}

        {paginatedMonths.length === 0 ? (
            <p className="text-center py-10 text-gray-500">該当する取引履歴はありません。</p>
        ) : (
            <>
                {/* --- Advanced Desktop Table --- */}
                <div className="hidden md:block overflow-x-auto">
                    {paginatedMonths.map(([month, txs]) => (
                        <div key={month} className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-700 bg-gray-100 p-3 rounded-t-lg border-b">
                                {new Date(month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                            </h2>
                            <table className="min-w-full w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>日付</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '35%' }}>取引内容</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%' }}>借方</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%' }}>貸方</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%' }}>金額</th>
                                        <th className="relative px-4 py-3" style={{ width: '8%' }}>
                                            <span className="sr-only">編集</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {txs.map(tx => {
                                    const { debitAccount, creditAccount, amount } = getSimpleEntryInfo(tx.entries);
                                    return (
                                        <React.Fragment key={tx.transactionId}>
                                            <tr onClick={() => handleRowClick(tx.transactionId)} className="cursor-pointer hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">{tx.transactionDate}</td>
                                                <td className="px-4 py-4 break-words">{tx.description}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">{debitAccount}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">{creditAccount}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right font-mono">{amount.toLocaleString()}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/edit-transaction/${tx.transactionId}`} className="text-accent hover:text-accent-dark">
                                                        編集
                                                    </Link>
                                                </td>
                                            </tr>
                                            {openTxId === tx.transactionId && (
                                                <tr className="bg-gray-100">
                                                    <td colSpan={6} className="p-4">
                                                        {/* (Existing detail view can be used here) */}
                                                        <div className="p-4 bg-white rounded-md shadow-inner">
                                                            <h4 className="font-bold mb-2 text-accent">仕訳詳細</h4>
                                                            <div className="grid grid-cols-3 gap-x-4 font-mono text-sm">
                                                                <div className="font-semibold border-b pb-1">勘定科目</div>
                                                                <div className="font-semibold border-b pb-1 text-right">借方(Dr.)</div>
                                                                <div className="font-semibold border-b pb-1 text-right">貸方(Cr.)</div>
                                                                {tx.entries.map(entry => (
                                                                    <React.Fragment key={entry.entryId}>
                                                                        <div className="py-1">{getAccountName(entry.accountId)}</div>
                                                                        <div className="py-1 text-right">{entry.debitAmount > 0 ? entry.debitAmount.toLocaleString() : '-'}</div>
                                                                        <div className="py-1 text-right">{entry.creditAmount > 0 ? entry.creditAmount.toLocaleString() : '-'}</div>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                  })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
                
                {/* --- Mobile View --- */}
                <div className="md:hidden space-y-4">
                    {paginatedMonths.map(([month, txs]) => (
                        <div key={month}>
                             <h2 className="text-lg font-semibold text-gray-700 bg-gray-100 p-3 rounded-t-lg border-b">
                                {new Date(month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                            </h2>
                            <div className="space-y-4 rounded-b-lg border border-t-0 p-2">
                                {txs.map(tx => {
                                    const { debitAccount, creditAccount} = getSimpleEntryInfo(tx.entries);
                                    return (
                                        <div key={tx.transactionId} className="bg-gray-50 border border-gray-200 rounded-lg">
                                            <div onClick={() => handleRowClick(tx.transactionId)} className="p-4 cursor-pointer">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-grow pr-4">
                                                        <p className="font-semibold text-gray-800">{tx.description}</p>
                                                        <p className="text-sm text-gray-500">{tx.transactionDate}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <Link 
                                                            to={`/edit-transaction/${tx.transactionId}`} 
                                                            className="text-accent hover:text-accent-dark text-sm font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            編集
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>借方: {debitAccount}</span>
                                                        <span>貸方: {creditAccount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {openTxId === tx.transactionId && (
                                                <div className="border-t border-gray-200 p-4">
                                                    <h4 className="font-bold mb-2 text-accent text-sm">仕訳詳細</h4>
                                                    <div className="font-mono text-xs">
                                                        <div className="grid grid-cols-3 gap-x-2 font-semibold border-b pb-1 mb-1">
                                                            <div>勘定科目</div>
                                                            <div className="text-right">借方</div>
                                                            <div className="text-right">貸方</div>
                                                        </div>
                                                        {tx.entries.map(entry => (
                                                            <div key={entry.entryId} className="grid grid-cols-3 gap-x-2 py-1">
                                                                <div>{getAccountName(entry.accountId)}</div>
                                                                <div className="text-right">{entry.debitAmount > 0 ? entry.debitAmount.toLocaleString() : '-'}</div>
                                                                <div className="text-right">{entry.creditAmount > 0 ? entry.creditAmount.toLocaleString() : '-'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;

