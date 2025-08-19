import React, { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import type { Account } from '../types';

interface JournalEntryForm {
  accountId: number | '';
  debitAmount: number | '';
  creditAmount: number | '';
}

interface Impact {
  accountName: string;
  amount: number;
  statement: '貸借対照表（BS）' | '損益計算書（PL）';
  category: string;
  subCategory?: string;
  type: 'debit' | 'credit';
  cashFlowImpact: '営業CF' | '投資CF' | '財務CF' | '影響なし';
}

const TransactionForm: React.FC = () => {
  const { addTransaction, accountsMaster } = useTransactions();
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<JournalEntryForm[]>([
    { accountId: '', debitAmount: '', creditAmount: '' },
    { accountId: '', debitAmount: '', creditAmount: '' },
  ]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [transactionImpacts, setTransactionImpacts] = useState<Impact[]>([]);

  // Simplified and more direct error checking, no separate state needed
  const isBalanced = totalDebit === totalCredit;
  const isAmountEntered = totalDebit > 0;

  useEffect(() => {
    const debitSum = entries.reduce((sum, entry) => sum + Number(entry.debitAmount || 0), 0);
    const creditSum = entries.reduce((sum, entry) => sum + Number(entry.creditAmount || 0), 0);
    setTotalDebit(debitSum);
    setTotalCredit(creditSum);
  }, [entries]);

  const handleEntryChange = (index: number, field: keyof JournalEntryForm, value: string | number) => {
    const newEntries = [...entries];
    const newEntry = { ...newEntries[index], [field]: value };

    if (field === 'debitAmount' && Number(value) > 0) {
        newEntry.creditAmount = '';
    } else if (field === 'creditAmount' && Number(value) > 0) {
        newEntry.debitAmount = '';
    }

    newEntries[index] = newEntry;
    setEntries(newEntries);
  };

  const addEntryRow = () => {
    setEntries([...entries, { accountId: '', debitAmount: '', creditAmount: '' }]);
  };
  
  const removeEntryRow = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const getAccountImpact = (accountId: number, amount: number, entryType: 'debit' | 'credit') => {
    const account = accountsMaster.find(a => a.id === accountId);
    if (!account) return null;

    let statement: '貸借対照表（BS）' | '損益計算書（PL）' = '貸借対照表（BS）';
    let category = '';
    let subCategory = '';
    let cashFlowImpact: Impact['cashFlowImpact'] = '影響なし';

    switch (account.type) {
      case 'asset':
        statement = '貸借対照表（BS）';
        category = '資産';
        subCategory = account.sub_type === 'current' ? '流動資産' : '固定資産';
        break;
      case 'liability':
        statement = '貸借対照表（BS）';
        category = '負債';
        subCategory = account.sub_type === 'current' ? '流動負債' : '固定負債';
        break;
      case 'equity':
        statement = '貸借対照表（BS）';
        category = '純資産';
        subCategory = account.name;
        break;
      case 'revenue':
        statement = '損益計算書（PL）';
        category = '収益';
        subCategory = account.sub_type === 'non-operating-revenue' ? '営業外収益' 
                    : account.sub_type === 'extraordinary-profit' ? '特別利益' 
                    : '売上';
        break;
      case 'expense':
        statement = '損益計算書（PL）';
        category = '費用';
        subCategory = account.sub_type === 'cogs' ? '売上原価'
                    : account.sub_type === 'sga' ? '販売費及び一般管理費'
                    : account.sub_type === 'non-operating-expense' ? '営業外費用'
                    : account.sub_type === 'extraordinary-loss' ? '特別損失'
                    : '法人税等';
        break;
    }

    // Simplified logic for CF impact of the account itself
    if (account.type === 'asset' && account.sub_type === 'fixed') cashFlowImpact = '投資CF';
    else if ((account.type === 'liability' && account.sub_type === 'fixed') || account.type === 'equity') cashFlowImpact = '財務CF';
    else if (account.type === 'revenue' || account.type === 'expense') cashFlowImpact = '営業CF';
    
    return {
      accountName: account.name,
      amount,
      statement,
      category,
      subCategory,
      type: entryType,
      cashFlowImpact,
    };
  };

  const handlePreview = () => {
    const validEntries = entries.filter(e => e.accountId && (e.debitAmount || e.creditAmount));
    if (validEntries.length === 0 || !isBalanced || !isAmountEntered) {
        alert('プレビューするには、貸借が一致した有効な仕訳を1つ以上入力してください。');
        return;
    }

    const impacts: Impact[] = [];
    let totalCashMovement = 0;
    const cashAccountIds = [1, 19];

    validEntries.forEach(entry => {
        const debitAmount = Number(entry.debitAmount || 0);
        const creditAmount = Number(entry.creditAmount || 0);

        if (debitAmount > 0) {
            const impact = getAccountImpact(Number(entry.accountId), debitAmount, 'debit');
            if (impact) impacts.push(impact);
            if (cashAccountIds.includes(Number(entry.accountId))) totalCashMovement += debitAmount;
        }
        if (creditAmount > 0) {
            const impact = getAccountImpact(Number(entry.accountId), creditAmount, 'credit');
            if (impact) impacts.push(impact);
            if (cashAccountIds.includes(Number(entry.accountId))) totalCashMovement -= creditAmount;
        }
    });
    
    // Determine overall CF impact category
    // This is a simplified logic. A more robust solution would analyze contra-accounts for each cash movement.
    const nonCashEntries = impacts.filter(imp => !cashAccountIds.includes(accountsMaster.find(a => a.name === imp.accountName)?.id || 0));
    let dominantCfCategory: Impact['cashFlowImpact'] = '営業CF'; // Default
    if (nonCashEntries.some(imp => imp.cashFlowImpact === '投資CF')) dominantCfCategory = '投資CF';
    else if (nonCashEntries.some(imp => imp.cashFlowImpact === '財務CF')) dominantCfCategory = '財務CF';

    // Assign the determined CF category to the cash-related impacts
    const finalImpacts = impacts.map(imp => {
        if (cashAccountIds.includes(accountsMaster.find(a => a.name === imp.accountName)?.id || 0)) {
            return { ...imp, cashFlowImpact: dominantCfCategory };
        }
        return imp;
    });

    setTransactionImpacts(finalImpacts);
    setIsPreviewModalOpen(true);
  };

  const resetForm = () => {
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setEntries([
      { accountId: '', debitAmount: '', creditAmount: '' },
      { accountId: '', debitAmount: '', creditAmount: '' },
    ]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEntries = entries.filter(e => e.accountId && (e.debitAmount || e.creditAmount));

    if (validEntries.length === 0) {
        alert('有効な仕訳がありません。勘定科目と金額を入力してください。');
        return;
    }

    if (!isBalanced || !isAmountEntered) {
      alert('貸借が一致しているか、金額が0でないか確認してください。');
      return;
    }
    
    const transactionData = {
      transactionDate,
      description,
      entries: validEntries.map((e, index) => ({
            entryId: index, transactionId: 0,
            accountId: Number(e.accountId),
            debitAmount: Number(e.debitAmount || 0),
            creditAmount: Number(e.creditAmount || 0)
        })),
    };
    addTransaction(transactionData);
    alert('取引が記録されました。');
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">取引日</label>
          <input type="date" id="transactionDate" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">摘要</label>
          <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm" placeholder="例: 借入金の返済（元金・利息）" />
        </div>
      </div>

      {/* --- Desktop Table --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">勘定科目</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">影響</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">借方</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貸方</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => {
                const account = accountsMaster.find(a => a.id === entry.accountId);
                let statementTag: React.ReactNode = null;
                const cashAccountIds = [1, 19];
                const isCashAccount = account && cashAccountIds.includes(account.id);

                if (account) {
                    const isPL = account.type === 'revenue' || account.type === 'expense';
                    statementTag = (
                        <div className="flex flex-col space-y-1">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPL ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {isPL ? 'PL' : 'BS'}
                            </span>
                            {isCashAccount && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    CF
                                </span>
                            )}
                        </div>
                    );
                }

                return (
                    <tr key={index}>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap min-w-[150px]">
                            <select value={entry.accountId} onChange={e => handleEntryChange(index, 'accountId', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm">
                                <option value="">選択してください</option>
                                {Object.entries(
                                  accountsMaster
                                    .sort((a, b) => a.id - b.id)
                                    .reduce((acc, account) => {
                                      const key = {
                                        asset: '資産',
                                        liability: '負債',
                                        equity: '純資産',
                                        revenue: '収益',
                                        expense: '費用',
                                      }[account.type];
                                      if (!acc[key]) {
                                        acc[key] = [];
                                      }
                                      acc[key].push(account);
                                      return acc;
                                    }, {} as Record<string, typeof accountsMaster>)
                                ).map(([category, accounts]) => (
                                  <optgroup key={category} label={category}>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                  </optgroup>
                                ))}
                            </select>
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                            {statementTag}
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                            <input type="number" placeholder="0" value={entry.debitAmount} onChange={e => handleEntryChange(index, 'debitAmount', Number(e.target.value))} disabled={!!entry.creditAmount && entry.creditAmount > 0} className="w-28 sm:w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                            <input type="number" placeholder="0" value={entry.creditAmount} onChange={e => handleEntryChange(index, 'creditAmount', Number(e.target.value))} disabled={!!entry.debitAmount && entry.debitAmount > 0} className="w-28 sm:w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                        </td>
                        <td className="text-center">
                            {entries.length > 2 && <button type="button" onClick={() => removeEntryRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>}
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card List --- */}
      <div className="md:hidden space-y-4">
        {entries.map((entry, index) => {
            const account = accountsMaster.find(a => a.id === entry.accountId);
            let statementTag: React.ReactNode = null;
            const cashAccountIds = [1, 19];
            const isCashAccount = account && cashAccountIds.includes(account.id);

            if (account) {
                const isPL = account.type === 'revenue' || account.type === 'expense';
                statementTag = (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500">影響:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPL ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isPL ? 'PL' : 'BS'}
                        </span>
                        {isCashAccount && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                CF
                            </span>
                        )}
                    </div>
                );
            }
            return (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-base font-semibold text-gray-800">仕訳 {index + 1}</label>
                  {entries.length > 2 && (
                    <button type="button" onClick={() => removeEntryRow(index)} className="text-red-500 hover:text-red-700 font-bold text-2xl leading-none flex items-center justify-center h-8 w-8 rounded-full hover:bg-red-100 transition-colors">&times;</button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                      <label htmlFor={`account-${index}`} className="block text-sm font-medium text-gray-500 mb-1">勘定科目</label>
                      <select id={`account-${index}`} value={entry.accountId} onChange={e => handleEntryChange(index, 'accountId', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-base">
                          <option value="">選択してください</option>
                          {Object.entries(
                            accountsMaster
                              .sort((a, b) => a.id - b.id)
                              .reduce((acc, account) => {
                                const key = {
                                  asset: '資産',
                                  liability: '負債',
                                  equity: '純資産',
                                  revenue: '収益',
                                  expense: '費用',
                                }[account.type];
                                if (!acc[key]) {
                                  acc[key] = [];
                                }
                                acc[key].push(account);
                                return acc;
                              }, {} as Record<string, typeof accountsMaster>)
                          ).map(([category, accounts]) => (
                            <optgroup key={category} label={category}>
                              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </optgroup>
                          ))}
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label htmlFor={`debit-${index}`} className="block text-sm font-medium text-gray-500 mb-1">借方</label>
                          <input id={`debit-${index}`} type="number" placeholder="0" value={entry.debitAmount} onChange={e => handleEntryChange(index, 'debitAmount', Number(e.target.value))} disabled={!!entry.creditAmount && entry.creditAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-base disabled:bg-gray-100" />
                      </div>
                      <div>
                          <label htmlFor={`credit-${index}`} className="block text-sm font-medium text-gray-500 mb-1">貸方</label>
                          <input id={`credit-${index}`} type="number" placeholder="0" value={entry.creditAmount} onChange={e => handleEntryChange(index, 'creditAmount', Number(e.target.value))} disabled={!!entry.debitAmount && entry.debitAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-base disabled:bg-gray-100" />
                      </div>
                  </div>
                  {statementTag}
                </div>
              </div>
            );
        })}
      </div>

      <div className="flex justify-center md:justify-end mt-4 md:mt-2">
        <button type="button" onClick={addEntryRow} className="w-full md:w-auto text-sm bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 py-2 px-4 rounded-lg transition-colors">+ 行を追加</button>
      </div>
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-right mb-2 sm:mb-0 sm:mr-6">
          <div className="text-sm text-gray-500">借方合計</div>
          <div className={`text-xl font-bold ${!isBalanced && isAmountEntered ? 'text-red-500' : 'text-gray-800'}`}>{totalDebit.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">貸方合計</div>
          <div className={`text-xl font-bold ${!isBalanced && isAmountEntered ? 'text-red-500' : 'text-gray-800'}`}>{totalCredit.toLocaleString()}</div>
        </div>
      </div>
      {!isBalanced && isAmountEntered && <p className="text-red-500 text-right mt-2">貸借の合計が一致していません。</p>}
      <div className="mt-6 flex flex-col md:flex-row justify-end gap-2 md:gap-4">
        <button
            type="button"
            onClick={handlePreview}
            className="text-lg md:text-base bg-gray-600 text-white font-bold py-3 md:py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400"
            disabled={!isBalanced || !isAmountEntered}
        >
            影響確認
        </button>
        <button 
            type="submit" 
            className="text-lg md:text-base bg-accent text-white font-bold py-3 md:py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed" 
            disabled={!isBalanced || !isAmountEntered}
        >
          登録する
        </button>
      </div>

      {isPreviewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">取引の影響プレビュー</h2>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                      {transactionImpacts.map((impact, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${impact.type === 'debit' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
                              <div className="flex justify-between items-center mb-2">
                                  <h3 className="text-lg font-semibold text-gray-700">{impact.type === 'debit' ? '借方' : '貸方'}: {impact.accountName}</h3>
                                  <span className={`font-bold text-xl ${impact.type === 'debit' ? 'text-blue-600' : 'text-green-600'}`}>
                                      {impact.amount.toLocaleString()}円
                                  </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1 pl-2">
                                  <p><strong>財務諸表:</strong> {impact.statement} &gt; {impact.category} &gt; {impact.subCategory}</p>
                                  <p><strong>CFへの影響:</strong> <span className="font-semibold">{impact.cashFlowImpact}</span></p>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-8 text-right">
                      <button
                          onClick={() => setIsPreviewModalOpen(false)}
                          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition duration-300"
                      >
                          閉じる
                      </button>
                  </div>
              </div>
          </div>
      )}
    </form>
  );
};

export default TransactionForm;