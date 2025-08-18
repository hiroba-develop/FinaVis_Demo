import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDemoOptions } from "../contexts/DemoOptionsContext";
import { useFiscalPeriod } from "../contexts/FiscalPeriodContext";
import FinaVisLogo from "/FinaVis_logo_login.png";

const Login: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setUseSampleData } = useDemoOptions();
  const { setStartDate, resetFiscalPeriod } = useFiscalPeriod();

  const handleDemoLogin = async (loadSampleData: boolean) => {
    setError("");
    setIsLoading(true);
    setUseSampleData(loadSampleData);

    resetFiscalPeriod(); // Reset fiscal period state on every login

    if (loadSampleData) {
      // Set the start date for the sample data, which will then fast-forward
      const sampleStartDate = new Date(Date.UTC(2024, 3, 1)); // April 1st
      setStartDate(sampleStartDate);
    }

    try {
      const success = await login("demo", "password");
      if (success) {
        navigate("/");
      } else {
        setError("デモログインに失敗しました。");
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWithoutSampleData = () => {
    setUseSampleData(false);
    resetFiscalPeriod(); // 期首日設定をリセット
    // ログイン処理を実行
    login("newuser", "password"); // 仮のユーザーでログイン
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <div className="text-center mb-8">
          <img src={FinaVisLogo} alt="FinaVis Logo" className="mx-auto h-32 w-auto" />
          <p className="text-gray-500 mt-2">財務三表を学ぶ、全ての人へ</p>
        </div>

        {error && (
          <div className="bg-sub-2 border-l-4 border-error text-error-dark p-4 mb-6" role="alert">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              下のボタンを押してデモを開始します。
            </p>
          </div>
          <button
              onClick={() => handleDemoLogin(true)}
              disabled={isLoading}
              className="w-full py-3 bg-accent rounded-lg text-white font-bold hover:bg-opacity-90 transition duration-300 disabled:bg-opacity-50"
            >
              {isLoading ? "読み込み中..." : "デモを開始する（サンプルデータ）"}
            </button>
            <button
              onClick={() => handleDemoLogin(false)}
              disabled={isLoading}
              className="w-full py-3 bg-gray-500 rounded-lg text-white font-bold hover:bg-gray-600 transition duration-300 disabled:bg-opacity-50"
            >
              {isLoading ? "読み込み中..." : "デモを開始する（初期データ）"}
            </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>この画面はデモ用に簡略化されています。</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
