import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import type { JournalEntry } from '../types';

const TransactionHistory: React.FC = () => {
  const { transactions, accountsMaster } = useTransactions();
  const [openTxId, setOpenTxId] = useState<number | null>(null);

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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">取引履歴</h1>
        
        {/* --- Advanced Desktop Table --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引内容</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">借方</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貸方</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(tx => {
                const { debitAccount, creditAccount, amount } = getSimpleEntryInfo(tx.entries);
                return (
                    <React.Fragment key={tx.transactionId}>
                        <tr onClick={() => handleRowClick(tx.transactionId)} className="cursor-pointer hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{tx.transactionDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{tx.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{debitAccount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{creditAccount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{amount.toLocaleString()}</td>
                        </tr>
                        {openTxId === tx.transactionId && (
                            <tr className="bg-gray-100">
                                <td colSpan={5} className="p-4">
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
        
        {/* --- Mobile View --- */}
        <div className="md:hidden space-y-4">
            {transactions.map(tx => {
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
            {transactions.length === 0 && (
                <p className="text-center py-10 text-gray-500">取引履歴はありません。</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;

