import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ヘルプセンター</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">FinaVis（フィナビズ）へようこそ！</h2>
            <p className="text-gray-700 leading-relaxed">
              FinaVis（フィナビズ）は、会計の初学者が財務三表（貸借対照表、損益計算書、キャッシュフロー計算書）の動きを視覚的に理解するための学習支援アプリケーションです。
              実際に取引を入力することで、その取引が財務諸表にどのような影響を与えるかをリアルタイムで確認できます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">基本的な使い方</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>取引の入力:</strong> 
                <p className="mt-1 pl-4">
                  ダッシュボード上部の「＋ 新規取引入力」セクションから取引を記録します。入力方法には「かんたん入力」と「仕訳入力」の2種類があります。
                </p>
                <ul className="list-disc list-inside mt-2 pl-8">
                  <li><strong>かんたん入力:</strong> 「取引の種類」と「金額」を選ぶだけで、簿記の知識がなくても簡単に入力できます。入力後、どのような仕訳になったか確認できるので学習に役立ちます。</li>
                  <li><strong>仕訳入力:</strong> 借方・貸方を意識して、本格的な仕訳形式で入力します。複合仕訳にも対応しています。</li>
                </ul>
              </li>
              <li>
                <strong>財務諸表の確認:</strong> 
                <p className="mt-1 pl-4">
                  取引を登録すると、ダッシュボードの財務三表カードや、各詳細ページ（貸借対照表、損益計算書、キャッシュフロー計算書）が自動で更新されます。入力した取引によって、どの数字がどのように変化したかを確認してみましょう。
                </p>
              </li>
               <li>
                <strong>取引履歴の確認と編集:</strong>
                <p className="mt-1 pl-4">
                  ナビゲーションの「取引履歴」ページでは、これまで入力したすべての取引を確認できます。各取引の詳細な仕訳内容を見たり、内容を間違えた場合は「編集」ボタンから修正したりすることができます。
                </p>
              </li>
               <li>
                <strong>繰り返し学習:</strong> 
                <p className="mt-1 pl-4">
                  様々なパターンの取引を入力してみて、財務三表がどのように連動して動くのかを体感してください。
                </p>
              </li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">会計の基本</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">貸借対照表 (B/S)</h3>
                <p className="text-gray-700 mt-2">
                  ある時点での企業の財政状態を示す表です。「資産」「負債」「純資産」の3つの要素で構成され、常に「資産 = 負債 + 純資産」の関係が成り立ちます。
                </p>
              </div>
               <div>
                <h3 className="text-xl font-bold">損益計算書 (P/L)</h3>
                <p className="text-gray-700 mt-2">
                  ある期間の企業の経営成績を示す表です。「収益」「費用」「利益」で構成され、どれだけ儲かったか（または損したか）を示します。
                </p>
              </div>
               <div>
                <h3 className="text-xl font-bold">キャッシュフロー計算書 (C/F)</h3>
                <p className="text-gray-700 mt-2">
                  ある期間のお金の流れ（キャッシュの増減）を示す表です。利益が出ていても現金が不足する「黒字倒産」などを防ぐために重要な指標です。
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Help;

