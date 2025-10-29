export default function MobilePaywall({ onClose }) {
  return (
    <div className="overlay-dimmer">
      <div className="paywall-modal">
        <button className="icon-button close" type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <p className="badge accent">Go Pro</p>
        <h2>Unlock faster follow-ups</h2>
        <p className="muted">
          Templates, recurring reminders, AI suggestions, premium integrations, and more.
        </p>

        <ul className="benefits-list">
          <li>Saved templates &amp; quick apply</li>
          <li>Recurring follow-ups</li>
          <li>AI suggested times</li>
          <li>Integrations &amp; custom sound</li>
        </ul>

        <div className="plan-selector">
          <button type="button" className="plan-option is-active">
            <span>Monthly</span>
            <strong>$4.99</strong>
            <span className="muted">Cancel anytime</span>
          </button>
          <button type="button" className="plan-option">
            <span>Yearly</span>
            <strong>$39.99</strong>
            <span className="muted">2 months free</span>
          </button>
        </div>

        <button type="button" className="primary">
          Upgrade now
        </button>
        <button type="button" className="ghost-button">
          Start 7-day trial
        </button>
        <p className="muted micro">Restore purchases • Terms apply</p>
      </div>
    </div>
  );
}
