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
import FinancialHistory from "./pages/FinancialHistory"; // FinancialHistoryをインポート
// import Settings from "./pages/Settings"; // Settingsをインポート
import { TransactionProvider } from "./contexts/TransactionContext";
import { DemoOptionsProvider, useDemoOptions } from "./contexts/DemoOptionsContext";
import { FiscalPeriodProvider, useFiscalPeriod } from "./contexts/FiscalPeriodContext";
import { HistoryProvider } from "./contexts/HistoryContext"; // HistoryProviderをインポート
import { useEffect, useState, useCallback } from "react"; // useCallbackを追加
import type { BalanceSheet as BalanceSheetType } from "./types";

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
          path="/balance-sheet/:periodIndex?"
          element={
            <ProtectedRoute>
              <Layout>
                <BalanceSheet />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/income-statement/:periodIndex?"
          element={
            <ProtectedRoute>
              <Layout>
                <IncomeStatement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cash-flow-statement/:periodIndex?"
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
        <Route
          path="/financial-history"
          element={
            <ProtectedRoute>
              <Layout>
                <FinancialHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        /> */}
         {/* Not Found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const TransactionProviderWithHooks: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useSampleData } = useDemoOptions();
  const { startDate } = useFiscalPeriod();
  const [openingRetainedEarnings, setOpeningRetainedEarnings] = useState(0);

  const handlePeriodClose = useCallback((closingBalanceSheet: BalanceSheetType) => {
    setOpeningRetainedEarnings(closingBalanceSheet.equity.利益剰余金);
  }, []);

  return (
    <TransactionProvider
      key={startDate ? startDate.toISOString() : 'initial'}
      useSampleData={useSampleData}
      initialRetainedEarnings={openingRetainedEarnings}
      onPeriodClose={handlePeriodClose}
    >
      {children}
    </TransactionProvider>
  );
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <DemoOptionsProvider>
        <HistoryProvider>
          <FiscalPeriodProvider>
            <TransactionProviderWithHooks>
              {children}
            </TransactionProviderWithHooks>
          </FiscalPeriodProvider>
        </HistoryProvider>
      </DemoOptionsProvider>
    </AuthProvider>
  );
};

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </Router>
  );
}

export default App;
