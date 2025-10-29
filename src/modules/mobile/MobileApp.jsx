import { useState } from "react";
import MobileHome from "./screens/MobileHome.jsx";
import MobileCreate from "./screens/MobileCreate.jsx";
import MobileTemplates from "./screens/MobileTemplates.jsx";
import MobileSettings from "./screens/MobileSettings.jsx";
import MobileReminderDetail from "./overlays/MobileReminderDetail.jsx";
import MobileSearchOverlay from "./overlays/MobileSearchOverlay.jsx";
import MobilePaywall from "./overlays/MobilePaywall.jsx";
import { useDeviceContext } from "../../context/DeviceContext.jsx";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "create", label: "Follow-Up", icon: "➕" },
  { id: "templates", label: "Templates", icon: "📎", pro: true },
  { id: "settings", label: "Menu", icon: "⚙️" },
];

export default function MobileApp() {
  const {
    activeReminderId,
    setActiveReminderId,
    completeReminder,
    snoozeReminder,
    undoCompleteReminder,
    updateReminderSchedule,
  } = useDeviceContext();
  const [activeTab, setActiveTab] = useState("home");
  const [createMode, setCreateMode] = useState("share");
  const [showDetail, setShowDetail] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleOpenReminder = (id) => {
    setActiveReminderId(id);
    setShowDetail(true);
  };

  const handleCreateManual = () => {
    setCreateMode("manual");
    setActiveTab("create");
  };

  const handleCreateShare = () => {
    setCreateMode("share");
    setActiveTab("create");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <MobileHome
            onOpenReminder={handleOpenReminder}
            onOpenSearch={() => setShowSearch(true)}
            onOpenManualCreate={handleCreateManual}
          />
        );
      case "create":
        return (
          <MobileCreate
            mode={createMode}
            onSwitchMode={setCreateMode}
            onUpgrade={() => setShowPaywall(true)}
          />
        );
      case "templates":
        return <MobileTemplates onUpgrade={() => setShowPaywall(true)} />;
      case "settings":
      default:
        return (
          <MobileSettings
            onOpenIntegrations={() => setShowPaywall(true)}
            onUpgrade={() => setShowPaywall(true)}
          />
        );
    }
  };

  return (
    <div className="mobile-stage">
      <div className="mobile-shell">
        <div className="mobile-status">
          <span className="mobile-signal" />
          <span>9:41</span>
          <span className="mobile-battery" />
        </div>
        <div className="mobile-content">{renderScreen()}</div>
        <nav className="mobile-tabbar" aria-label="Primary navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mobile-tabbar__item ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => {
                if (tab.pro) setShowPaywall(true);
                setActiveTab(tab.id);
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.pro && <span className="tab-pro-pill">PRO</span>}
            </button>
          ))}
        </nav>
      </div>

      {showDetail && (
        <MobileReminderDetail
          reminderId={activeReminderId}
          onClose={() => setShowDetail(false)}
          onUpgrade={() => setShowPaywall(true)}
          onComplete={(id) => {
            completeReminder(id);
            setShowDetail(false);
          }}
          onSnooze={(id) => {
            snoozeReminder(id);
            setShowDetail(false);
          }}
          onUndo={(id) => {
            undoCompleteReminder(id);
            setShowDetail(false);
          }}
          onReschedule={(id, payload) => {
            updateReminderSchedule(id, payload);
            setShowDetail(false);
          }}
        />
      )}

      {showSearch && <MobileSearchOverlay onClose={() => setShowSearch(false)} />}

      {showPaywall && <MobilePaywall onClose={() => setShowPaywall(false)} />}

      <div className="mobile-floating-actions">
        <button
          type="button"
          className="floating-btn"
          onClick={handleCreateManual}
          aria-label="Create manual follow-up"
        >
          + Follow-Up
        </button>
        <button
          type="button"
          className="floating-outline-btn"
          onClick={handleCreateShare}
        >
          Share Sheet
        </button>
      </div>
    </div>
  );
}
