import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import type { Transaction} from '../types';

interface JournalEntryForm {
    accountId: number | '';
    debitAmount: number | '';
    creditAmount: number | '';
}

const EditTransaction: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const { transactions, accountsMaster, updateTransaction } = useTransactions();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [description, setDescription] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [entries, setEntries] = useState<JournalEntryForm[]>([]);
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);

    useEffect(() => {
        const id = Number(transactionId);
        const txToEdit = transactions.find(t => t.transactionId === id);
        if (txToEdit) {
            setTransaction(txToEdit);
            setDescription(txToEdit.description);
            setTransactionDate(txToEdit.transactionDate);
            setEntries(txToEdit.entries.map(e => ({
                accountId: e.accountId,
                debitAmount: e.debitAmount || '',
                creditAmount: e.creditAmount || '',
            })));
        } else {
            alert('指定された取引が見つかりません。');
            navigate('/history');
        }
    }, [transactionId, transactions, navigate]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isBalanced = totalDebit === totalCredit;
        const isAmountEntered = totalDebit > 0;

        if (!isBalanced || !isAmountEntered) {
            alert('貸借が一致しているか、金額が0でないか確認してください。');
            return;
        }

        if (transaction) {
            const updatedTransaction: Transaction = {
                ...transaction,
                description,
                transactionDate,
                entries: entries.map((e, index) => ({
                    entryId: transaction.entries[index]?.entryId || Date.now() + index,
                    transactionId: transaction.transactionId,
                    accountId: Number(e.accountId),
                    debitAmount: Number(e.debitAmount || 0),
                    creditAmount: Number(e.creditAmount || 0),
                })),
            };
            updateTransaction(updatedTransaction);
            alert('取引が更新されました。');
            navigate('/history');
        }
    };

    if (!transaction) {
        return <div className="container mx-auto px-4 py-8">読み込み中...</div>;
    }

    const isBalanced = totalDebit === totalCredit;
    const isAmountEntered = totalDebit > 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">取引の編集</h1>
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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">勘定科目</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">借方</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">貸方</th>
                        <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((entry, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">
                            <select value={entry.accountId} onChange={e => handleEntryChange(index, 'accountId', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm">
                                <option value="">選択してください</option>
                                {accountsMaster.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
                            </select>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                            <input type="number" placeholder="0" value={entry.debitAmount} onChange={e => handleEntryChange(index, 'debitAmount', Number(e.target.value))} disabled={!!entry.creditAmount && entry.creditAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                            <input type="number" placeholder="0" value={entry.creditAmount} onChange={e => handleEntryChange(index, 'creditAmount', Number(e.target.value))} disabled={!!entry.debitAmount && entry.debitAmount > 0} className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:bg-gray-100" />
                            </td>
                            <td className="text-center">
                            {entries.length > 1 && <button type="button" onClick={() => removeEntryRow(index)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-2">
                    <button type="button" onClick={addEntryRow} className="text-sm text-accent font-semibold hover:underline">+ 行を追加</button>
                </div>
                <div className="flex justify-end items-center mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-right mr-6">
                    <div className="text-sm text-gray-500">借方合計</div>
                    <div className={`text-xl font-bold ${!isBalanced && isAmountEntered ? 'text-red-500' : 'text-gray-800'}`}>{totalDebit.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                    <div className="text-sm text-gray-500">貸方合計</div>
                    <div className={`text-xl font-bold ${!isBalanced && isAmountEntered ? 'text-red-500' : 'text-gray-800'}`}>{totalCredit.toLocaleString()}</div>
                    </div>
                </div>
                {!isBalanced && isAmountEntered && <p className="text-red-500 text-right mt-2">貸借の合計が一致していません。</p>}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/history')} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                    キャンセル
                    </button>
                    <button type="submit" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400" disabled={!isBalanced || !isAmountEntered}>
                    更新する
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransaction;
