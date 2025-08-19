import React, { useState, useMemo } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import type { SimpleTransaction, Account } from '../types';

interface Impact {
  accountName: string;
  amount: number;
  statement: '貸借対照表（BS）' | '損益計算書（PL）';
  category: string;
  subCategory?: string;
  type: 'debit' | 'credit';
  cashFlowImpact: '営業CF' | '投資CF' | '財務CF' | '影響なし';
}

const SimpleTransactionForm: React.FC = () => {
  const { addSimpleTransaction, transactionTemplates, accountsMaster } = useTransactions();

  const [templateId, setTemplateId] = useState<string>(transactionTemplates[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transactionTemplates[0]?.label || '');
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [transactionImpacts, setTransactionImpacts] = useState<Impact[]>([]);

  const selectedImpacts = useMemo(() => {
    if (!templateId) return { debitImpact: null, creditImpact: null, debitAccountName: null, creditAccountName: null, cfImpact: false };
    const template = transactionTemplates.find(t => t.id === templateId);
    if (!template) return { debitImpact: null, creditImpact: null, debitAccountName: null, creditAccountName: null, cfImpact: false };

    const debitAccount = accountsMaster.find(a => a.id === template.debitAccountId);
    const creditAccount = accountsMaster.find(a => a.id === template.creditAccountId);
    
    const getImpact = (account: Account | undefined) => {
        if (!account) return null;
        let statement: 'BS' | 'PL' = 'BS';
        if (account.type === 'revenue' || account.type === 'expense') {
            statement = 'PL';
        }
        return { statement };
    }

    const cashAccountIds = [1, 19]; // 現金, 普通預金
    const cfImpact = (debitAccount && cashAccountIds.includes(debitAccount.id)) || (creditAccount && cashAccountIds.includes(creditAccount.id));

    return {
        debitImpact: getImpact(debitAccount),
        creditImpact: getImpact(creditAccount),
        debitAccountName: debitAccount?.name,
        creditAccountName: creditAccount?.name,
        cfImpact
    };
  }, [templateId, transactionTemplates, accountsMaster]);


  const getAccountImpact = (accountId: number, transactionAmount: number, entryType: 'debit' | 'credit'): Impact | null => {
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
    
    // Simplified Cash Flow Impact Logic
    const cashAccountIds = [1, 19]; // 現金, 普通預金
    if (cashAccountIds.includes(account.id)) {
        // This logic needs the other side of the transaction, which we determine in handlePreview
    } else {
        if (account.type === 'asset' && account.sub_type === 'fixed') cashFlowImpact = '投資CF';
        else if ((account.type === 'liability' && account.sub_type === 'fixed') || account.type === 'equity') cashFlowImpact = '財務CF';
        else if (account.type === 'revenue' || account.type === 'expense') cashFlowImpact = '営業CF';
    }


    return {
      accountName: account.name,
      amount: transactionAmount,
      statement,
      category,
      subCategory,
      type: entryType,
      cashFlowImpact,
    };
  };

  const handlePreview = () => {
    if (!templateId || amount === '' || amount <= 0) {
      alert('取引の種類を選択し、0より大きい金額を入力してください。');
      return;
    }
    const template = transactionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const debitImpact = getAccountImpact(template.debitAccountId, Number(amount), 'debit');
    const creditImpact = getAccountImpact(template.creditAccountId, Number(amount), 'credit');
    
    // Determine CF impact based on the "other" account
    const cashAccountIds = [1, 19];
    const isDebitCash = cashAccountIds.includes(template.debitAccountId);
    const isCreditCash = cashAccountIds.includes(template.creditAccountId);

    if (debitImpact && creditImpact) {
        if (isDebitCash && !isCreditCash) {
            debitImpact.cashFlowImpact = creditImpact.cashFlowImpact;
        } else if (!isDebitCash && isCreditCash) {
            creditImpact.cashFlowImpact = debitImpact.cashFlowImpact;
        } else if (isDebitCash && isCreditCash) {
            // Transfer between cash accounts
            debitImpact.cashFlowImpact = '影響なし';
            creditImpact.cashFlowImpact = '影響なし';
        } else {
            // No cash involved
            debitImpact.cashFlowImpact = '影響なし';
            creditImpact.cashFlowImpact = '影響なし';
        }
    }


    const impacts = [debitImpact, creditImpact].filter((i): i is Impact => i !== null);
    setTransactionImpacts(impacts);
    setIsPreviewModalOpen(true);
  };

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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">取引の種類</label>
        <select
          id="templateId"
          value={templateId}
          onChange={handleTemplateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
        >
          {Object.entries(
            transactionTemplates.reduce((acc, template) => {
              if (!acc[template.category]) {
                acc[template.category] = [];
              }
              acc[template.category].push(template);
              return acc;
            }, {} as Record<string, typeof transactionTemplates>)
          ).map(([category, templates]) => (
            <optgroup key={category} label={category}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </optgroup>
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

      <div className="text-right flex items-center justify-end gap-4">
        <div className="flex-grow text-left text-sm text-gray-500 flex items-center gap-4">
            {selectedImpacts.debitImpact && selectedImpacts.creditImpact && (
                <>
                    <span>
                        <span className="font-semibold">借方:</span> {selectedImpacts.debitAccountName}
                        <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedImpacts.debitImpact.statement === 'BS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {selectedImpacts.debitImpact.statement}
                        </span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                        <span className="font-semibold">貸方:</span> {selectedImpacts.creditAccountName}
                        <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedImpacts.creditImpact.statement === 'BS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {selectedImpacts.creditImpact.statement}
                        </span>
                    </span>
                </>
            )}
            {selectedImpacts.cfImpact && (
              <>
                <span className="text-gray-300">|</span>
                <span>
                    <span className="font-semibold">影響:</span>
                    <span className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        CF
                    </span>
                </span>
              </>
            )}
        </div>
        <button
            type="button"
            onClick={handlePreview}
            className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400"
            disabled={!templateId || amount === '' || amount <= 0}
        >
            影響確認
        </button>
        <button
          type="submit"
          className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-gray-400"
          disabled={!templateId || amount === '' || amount <= 0}
        >
          登録する
        </button>
      </div>
    </form>
    {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">取引の影響プレビュー</h2>
                <div className="space-y-6">
                    {transactionImpacts.map((impact, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${impact.type === 'debit' ? 'border-blue-100' : 'border-green-100'}`}>
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
    </>
  );
};

export default SimpleTransactionForm;
