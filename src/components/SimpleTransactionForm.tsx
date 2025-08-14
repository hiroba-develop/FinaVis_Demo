import React, { useState } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import type { SimpleTransaction } from '../types';

const SimpleTransactionForm: React.FC = () => {
  const { addSimpleTransaction, transactionTemplates, accountsMaster } = useTransactions();

  const [templateId, setTemplateId] = useState<string>(transactionTemplates[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transactionTemplates[0]?.label || '');

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplateId = e.target.value;
    const selectedTemplate = transactionTemplates.find(t => t.id === selectedTemplateId);
    setTemplateId(selectedTemplateId);
    setDescription(selectedTemplate?.label || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || amount === '' || amount <= 0) {
      alert('取引の種類を選択し、0より大きい金額を入力してください。');
      return;
    }

    const transactionData: SimpleTransaction = {
      templateId,
      amount: Number(amount),
      transactionDate,
      description,
    };

    addSimpleTransaction(transactionData);

    // Create feedback message
    const template = transactionTemplates.find(t => t.id === templateId);
    const debitAccount = accountsMaster.find(a => a.id === template?.debitAccountId);
    const creditAccount = accountsMaster.find(a => a.id === template?.creditAccountId);

    const feedbackMessage = `
      以下の取引が記録されました:
      ----------------------------------
      取引の種類: ${template?.label}
      金額: ${Number(amount).toLocaleString()}円
      摘要: ${description || 'なし'}
      ----------------------------------
      仕訳:
      借方 (Dr.): ${debitAccount?.name} ${Number(amount).toLocaleString()}
      貸方 (Cr.): ${creditAccount?.name} ${Number(amount).toLocaleString()}
    `;

    alert(feedbackMessage);
    
    // Reset form
    setTemplateId(transactionTemplates[0]?.id || '');
    setAmount('');
    setDescription('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">取引の種類</label>
        <select
          id="templateId"
          value={templateId}
          onChange={handleTemplateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
        >
          {transactionTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金額</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">取引日</label>
          <input
            type="date"
            id="transactionDate"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">摘要（メモ）</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            placeholder="取引の詳細"
          />
        </div>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400"
          disabled={!templateId || amount === '' || amount <= 0}
        >
          登録する
        </button>
      </div>
    </form>
  );
};

export default SimpleTransactionForm;
