import { useEffect, useState } from "react";
import MobileApp from "./modules/mobile/MobileApp.jsx";
import DesktopApp from "./modules/desktop/DesktopApp.jsx";
import AuthScreen from "./components/Auth/AuthScreen.jsx";
import { DeviceContextProvider } from "./context/DeviceContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { logout } from "./services/authService.js";

const MODES = [
  { id: "mobile", label: "Mobile" },
  { id: "desktop", label: "Desktop" },
];

function AppContent() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("mobile");
  const [theme, setTheme] = useState("light");
  const isDarkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <DeviceContextProvider>
      <div className="app-wrapper">
        <header className="app-header">
          <div>
            <p className="badge">Follow Up Later • Prototype</p>
            <h1>Dual-platform experience</h1>
            <p className="subtitle">
              Welcome, {user.displayName || user.email}!
            </p>
          </div>
          <div className="app-header__actions">
            <div className="mode-toggle">
              {MODES.map((option) => (
                <button
                  key={option.id}
                  className={`mode-toggle__button ${
                    mode === option.id ? "is-active" : ""
                  }`}
                  onClick={() => setMode(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              className={`theme-toggle ${isDarkMode ? "is-active" : ""}`}
              onClick={toggleTheme}
              type="button"
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? "Light theme" : "Dark theme"}
            </button>
            <button
              className="ghost-button"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="app-stage">
          {mode === "mobile" ? <MobileApp /> : <DesktopApp />}
        </main>
      </div>
    </DeviceContextProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
