import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FinaVisLogo from "/FinaVis_logo_login.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("ユーザー名とパスワードを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        navigate("/");
      } else {
        setError("ログインに失敗しました。入力情報を確認してください。");
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="text-sm font-bold text-gray-600 block"
            >
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-gray-600 block"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-accent rounded-lg text-white font-bold hover:bg-opacity-90 transition duration-300 disabled:bg-opacity-50"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{" "}
            <Link to="/register" className="text-accent font-bold hover:underline">
              新規登録
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>デモ用に、任意のユーザー名とパスワードでログインできます。</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
