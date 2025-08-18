import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // useLocationをインポート
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import BalanceSheet from "./pages/BalanceSheet";
import IncomeStatement from "./pages/IncomeStatement";
import CashFlowStatement from "./pages/CashFlowStatement";
import TransactionHistory from "./pages/TransactionHistory";
import EditTransaction from "./pages/EditTransaction";
import Help from "./pages/Help";
import { TransactionProvider } from "./contexts/TransactionContext";
import { DemoOptionsProvider, useDemoOptions } from "./contexts/DemoOptionsContext";
import { useEffect } from "react";

// スクロールをトップに戻すコンポーネント
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// 認証が必要なページをラップするコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  useEffect(() => {
    document.title = "FinaVis - 財務諸表可視化アプリ";
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/balance-sheet"
          element={
            <ProtectedRoute>
              <Layout>
                <BalanceSheet />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/income-statement"
          element={
            <ProtectedRoute>
              <Layout>
                <IncomeStatement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cash-flow-statement"
          element={
            <ProtectedRoute>
              <Layout>
                <CashFlowStatement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <Layout>
                <TransactionHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-transaction/:transactionId"
          element={
            <ProtectedRoute>
              <Layout>
                <EditTransaction />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Layout>
                <Help />
              </Layout>
            </ProtectedRoute>
          }
        />
         {/* Not Found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useSampleData } = useDemoOptions();
  return <TransactionProvider useSampleData={useSampleData}>{children}</TransactionProvider>;
};

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <AuthProvider>
        <DemoOptionsProvider>
          <AppProviders>
            <AppContent />
          </AppProviders>
        </DemoOptionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
