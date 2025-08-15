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
              FinaVisは、会計初学者が財務三表（B/S, P/L, C/F）のつながりを視覚的に理解するための学習アプリです。
              取引を入力するだけで、財務諸表がリアルタイムでどのように変動するかを確認できます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">基本的な使い方</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>取引の入力:</strong> 
                <p className="mt-1 pl-4">
                  ダッシュボード上部の「＋ 新規取引入力」から取引を記録します。「かんたん入力」と「仕訳入力」の2種類があります。
                </p>
                <ul className="list-disc list-inside mt-2 pl-8">
                  <li><strong>かんたん入力:</strong> 日常的な取引テンプレートを選ぶだけで、簿記の知識がなくても簡単に入力できます。</li>
                  <li><strong>仕訳入力:</strong> 借方・貸方を意識して、本格的な仕訳形式で入力します。</li>
                </ul>
              </li>
              <li>
                <strong>財務諸表の確認:</strong> 
                <p className="mt-1 pl-4">
                  取引を登録すると、各財務諸表の数値が自動で更新されます。入力した取引によって、どの数字がどう変化したかを確認してみましょう。
                </p>
              </li>
               <li>
                <strong>グラフで視覚的に理解:</strong>
                <p className="mt-1 pl-4">
                  B/SとP/Lのページには、内容を視覚的に理解するためのグラフがあります。右上のボタンで2種類のグラフを切り替えられます。
                </p>
                <ul className="list-disc list-inside mt-2 pl-8">
                  <li><strong>ボックス図:</strong> 各項目の構成比率を面積で示します。全体に対してどの項目が大きいか、バランスを直感的に把握できます。</li>
                  <li><strong>ウォーターフォール図:</strong> 数値の増減をステップごとに示します。利益や残高がどのように計算されていくのか、その過程を追うことができます。</li>
                </ul>
              </li>
               <li>
                <strong>取引履歴の確認と編集:</strong>
                <p className="mt-1 pl-4">
                  「取引履歴」ページでは、過去の入力内容を確認・編集できます。
                </p>
              </li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">財務三表のキホン</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">貸借対照表 (B/S) - 企業の財産状況</h3>
                <p className="text-gray-700 mt-2">
                  ある一時点での企業の財政状態（どれだけ財産があり、どれだけ借金があるか）を示す成績表です。企業の<strong>安全性や体力</strong>が分かります。<br/>
                  常に「資産 = 負債 + 純資産」の関係が成り立ちます。
                </p>
              </div>
               <div>
                <h3 className="text-xl font-bold">損益計算書 (P/L) - 企業の稼ぐ力</h3>
                <p className="text-gray-700 mt-2">
                  一定期間の企業の経営成績（どれだけ儲けて、どれだけ費用を使ったか）を示す成績表です。企業の<strong>収益性や稼ぐ力</strong>が分かります。
                </p>
              </div>
               <div>
                <h3 className="text-xl font-bold">キャッシュフロー計算書 (C/F) - 企業の資金繰り</h3>
                <p className="text-gray-700 mt-2">
                  一定期間のお金の流れ（キャッシュの増減）を示す表です。利益が出ていても現金が不足する「黒字倒産」などを防ぐために重要な指標で、企業の<strong>支払い能力や資金繰りの状況</strong>が分かります。
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

