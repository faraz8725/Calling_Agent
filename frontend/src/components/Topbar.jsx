/*
import { useLocation } from "react-router-dom";

function Topbar() {
  const location = useLocation();

  const titles = {
    "/": "Overview",
    "/calls": "Call History",
    "/settings": "Settings"
  };

  const title = location.pathname.startsWith("/calls/")
    ? "Call Details"
    : titles[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>Monitor and manage your AI phone calls</p>
      </div>

      <div className="topbar-right">
        <span className="live-indicator">
          <span className="status-dot"></span>
          System Active
        </span>
        <div className="profile-avatar">AI</div>
      </div>
    </header>
  );
}

export default Topbar;
*/


import { useLocation, useNavigate } from "react-router-dom";

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const titles = {
    "/": "Overview",
    "/calls": "Call History",
    "/settings": "Settings",
  };

  const title = location.pathname.startsWith("/calls/")
    ? "Call Details"
    : titles[location.pathname] || "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("call_china_admin_token");
     window.dispatchEvent(new Event("call-china-auth-change"));
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>Monitor and manage your AI phone calls</p>
      </div>

      <div className="topbar-right">
        <span className="live-indicator">
          <span className="status-dot"></span>
          System Active
        </span>

        <div className="profile-avatar">AI</div>

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
