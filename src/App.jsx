import { useEffect, useState } from "react";
import MobileApp from "./modules/mobile/MobileApp.jsx";
import DesktopApp from "./modules/desktop/DesktopApp.jsx";
import AuthScreen from "./components/Auth/AuthScreen.jsx";
import { DeviceContextProvider } from "./context/DeviceContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { logout } from "./services/authService.js";

// Detect if user is on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;
};

function AppContent() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState(() => isMobileDevice() ? "mobile" : "desktop");
  const [theme, setTheme] = useState("light");
  const [showDevTools, setShowDevTools] = useState(false);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Listen for window resize to switch modes automatically
  useEffect(() => {
    const handleResize = () => {
      if (!showDevTools) {
        setMode(isMobileDevice() ? "mobile" : "desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showDevTools]);

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

  // On mobile devices, show full-screen mobile app without wrapper
  if (isMobileDevice() && !showDevTools) {
    return (
      <DeviceContextProvider>
        <div className="mobile-fullscreen">
          <MobileApp />
        </div>
      </DeviceContextProvider>
    );
  }

  // On desktop or when dev tools are enabled, show the prototype wrapper
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
              <button
                className={`mode-toggle__button ${mode === "mobile" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("mobile");
                  setShowDevTools(true);
                }}
                type="button"
              >
                Mobile
              </button>
              <button
                className={`mode-toggle__button ${mode === "desktop" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("desktop");
                  setShowDevTools(true);
                }}
                type="button"
              >
                Desktop
              </button>
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
