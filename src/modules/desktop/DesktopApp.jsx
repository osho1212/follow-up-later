import { useState } from "react";
import DesktopHome from "./screens/DesktopHome.jsx";
import DesktopCreate from "./screens/DesktopCreate.jsx";
import DesktopTemplates from "./screens/DesktopTemplates.jsx";
import DesktopSettings from "./screens/DesktopSettings.jsx";
import DesktopReminderDetail from "./panels/DesktopReminderDetail.jsx";
import { useDeviceContext } from "../../context/DeviceContext.jsx";
import QuickAddOverlay from "./components/QuickAddOverlay.jsx";

const NAV_ITEMS = [
  { id: "home", label: "Timeline", icon: "🗓️" },
  { id: "create", label: "Create", icon: "➕" },
  { id: "templates", label: "Templates", icon: "📎" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function DesktopApp() {
  const { activeReminderId, setActiveReminderId, addReminder, removeReminder } = useDeviceContext();
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [activeView, setActiveView] = useState("home");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "create":
        return <DesktopCreate />;
      case "templates":
        return <DesktopTemplates />;
      case "settings":
        return <DesktopSettings />;
      case "home":
      default:
        return (
          <DesktopHome
            onSelectReminder={(id) => {
              setActiveReminderId(id);
              setIsDetailOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="desktop-shell">
      <aside className="desktop-rail" aria-label="Primary navigation">
        <div className="desktop-rail__brand">F</div>
        <nav className="desktop-rail__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`desktop-rail__item ${activeView === item.id ? "is-active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="label">{item.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="desktop-rail__cta">
          Upgrade
        </button>
      </aside>

      <div className="desktop-main">
        <header className="desktop-topbar">
          <div className="command-palette">
            <span className="icon">⌘</span>
            <span>Search or jump...</span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-btn"
              onClick={() => {
                setActiveView("home");
                setIsQuickAddOpen(true);
              }}
            >
              + Follow-Up
            </button>
            <button type="button" className="icon-button">
              🔔
            </button>
            <button type="button" className="avatar">
              <span aria-hidden="true">👤</span>
            </button>
          </div>
        </header>

        <section className="desktop-content">{renderContent()}</section>
      </div>

      <DesktopReminderDetail
        isOpen={isDetailOpen}
        reminderId={activeReminderId}
        onClose={() => setIsDetailOpen(false)}
        onDelete={(id) => {
          const nextActiveId = removeReminder(id);
          if (!nextActiveId) {
            setIsDetailOpen(false);
          }
          setActiveView("home");
        }}
      />
      {isQuickAddOpen && (
        <QuickAddOverlay
          onClose={() => setIsQuickAddOpen(false)}
          onSubmit={(payload) => {
            addReminder(payload);
            setIsDetailOpen(true);
            setIsQuickAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
