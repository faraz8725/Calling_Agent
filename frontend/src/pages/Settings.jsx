import "../styles/Settings.css";

function Settings() {
  return (
    <section className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your Call_China agent configuration.</p>
      </div>

      <div className="settings-card">
        <div className="settings-icon">📞</div>

        <div>
          <h2>AI Calling Agent</h2>
          <p>
            Your phone calling agent is configured through LiveKit.
          </p>
          <span className="settings-status">
            Configuration managed in LiveKit
          </span>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-icon">🗄️</div>

        <div>
          <h2>Call History Database</h2>
          <p>
            Completed call records and transcripts are stored in MongoDB.
          </p>
          <span className="settings-status">Backend API: Port 5000</span>
        </div>
      </div>
    </section>
  );
}

export default Settings;