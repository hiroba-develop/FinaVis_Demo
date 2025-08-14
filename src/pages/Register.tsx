import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FinaVisLogo from "/FinaVis_logo_login.png";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("すべての項目を入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, you'd make an API call to register the user.
      console.log({ username, password, role });
      // Mock registration success
      alert("新規登録が完了しました。ログインしてください。");
      navigate("/login");
    } catch (err) {
      setError("新規登録処理中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <div className="text-center mb-8">
          <img src={FinaVisLogo} alt="FinaVis Logo" className="mx-auto h-24 w-auto" />
          <p className="text-gray-500 mt-2">財務三表を学ぶ、全ての人へ</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
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
              required
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="text-sm font-bold text-gray-600 block"
            >
              役割
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "teacher")}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent"
            >
              <option value="student">受講者</option>
              <option value="teacher">研修者</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-accent rounded-lg text-white font-bold hover:bg-opacity-90 transition duration-300 disabled:bg-opacity-50"
            >
              {isLoading ? "登録中..." : "新規登録"}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？{" "}
            <Link to="/login" className="text-accent font-bold hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

