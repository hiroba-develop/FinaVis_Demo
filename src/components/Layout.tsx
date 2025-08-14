import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FinaVisLogo from '/FinaVis_logo_icon_moji_transparent.png';

const navigationItems = [
  { name: "ダッシュボード", path: "/" },
  { name: "取引履歴", path: "/transaction-history" },
  { name: "ヘルプ", path: "/help" },
];

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-sub-1">
      {/* Header */}
      <header className="bg-main shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/">
                <img src={FinaVisLogo} alt="FinaVis Logo" className="h-12 w-auto" />
              </Link>
            </div>
            <div className="flex items-center">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? "bg-accent text-white"
                        : "text-white hover:bg-accent hover:bg-opacity-75"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                 <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-accent hover:bg-opacity-75"
                  >
                    ログアウト
                  </button>
              </div>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-accent focus:outline-none"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? "bg-accent text-white"
                      : "text-white hover:bg-accent hover:bg-opacity-75"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
               <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-accent hover:bg-opacity-75"
                >
                  ログアウト
                </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
