import React, { useState, useEffect } from 'react';
import { useTransactions } from '../contexts/TransactionContext';

interface JournalEntryForm {
  accountId: number | '';
  debitAmount: number | '';
  creditAmount: number | '';
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
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">借方</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貸方</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
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
                  <input type="number" placeholder="0" value={entry.debitAmount} onChange={e => handleEntryChange(index, 'debitAmount', Number(e.target.value))} disabled={!!entry.creditAmount && entry.creditAmount > 0} className="w-28 sm:w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                </td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                  <input type="number" placeholder="0" value={entry.creditAmount} onChange={e => handleEntryChange(index, 'creditAmount', Number(e.target.value))} disabled={!!entry.debitAmount && entry.debitAmount > 0} className="w-28 sm:w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                </td>
                <td className="text-center">
                  {entries.length > 2 && <button type="button" onClick={() => removeEntryRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card List --- */}
      <div className="md:hidden space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">仕訳 {index + 1}</label>
              {entries.length > 2 && (
                <button type="button" onClick={() => removeEntryRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none -mt-1">&times;</button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                  <label htmlFor={`account-${index}`} className="block text-xs font-medium text-gray-500 mb-1">勘定科目</label>
                  <select id={`account-${index}`} value={entry.accountId} onChange={e => handleEntryChange(index, 'accountId', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm">
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
                      <label htmlFor={`debit-${index}`} className="block text-xs font-medium text-gray-500 mb-1">借方</label>
                      <input id={`debit-${index}`} type="number" placeholder="0" value={entry.debitAmount} onChange={e => handleEntryChange(index, 'debitAmount', Number(e.target.value))} disabled={!!entry.creditAmount && entry.creditAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                  </div>
                  <div>
                      <label htmlFor={`credit-${index}`} className="block text-xs font-medium text-gray-500 mb-1">貸方</label>
                      <input id={`credit-${index}`} type="number" placeholder="0" value={entry.creditAmount} onChange={e => handleEntryChange(index, 'creditAmount', Number(e.target.value))} disabled={!!entry.debitAmount && entry.debitAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-2">
        <button type="button" onClick={addEntryRow} className="text-sm text-accent font-semibold hover:underline">+ 行を追加</button>
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
      <div className="mt-6 text-right">
        <button type="submit" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!isBalanced || !isAmountEntered}>
          登録する
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;