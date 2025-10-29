import { useEffect, useState } from "react";
import MobileApp from "./modules/mobile/MobileApp.jsx";
import DesktopApp from "./modules/desktop/DesktopApp.jsx";
import { DeviceContextProvider } from "./context/DeviceContext.jsx";

const MODES = [
  { id: "mobile", label: "Mobile" },
  { id: "desktop", label: "Desktop" },
];

export default function App() {
  const [mode, setMode] = useState("mobile");
  const [theme, setTheme] = useState("light");
  const isDarkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <DeviceContextProvider>
      <div className="app-wrapper">
        <header className="app-header">
          <div>
            <p className="badge">Follow Up Later • Prototype</p>
            <h1>Dual-platform experience</h1>
            <p className="subtitle">
              Explore the mobile and desktop shells crafted for a premium yet
              focused follow-up workflow.
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
          </div>
        </header>

        <main className="app-stage">
          {mode === "mobile" ? <MobileApp /> : <DesktopApp />}
        </main>
      </div>
    </DeviceContextProvider>
  );
}
