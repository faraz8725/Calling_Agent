/*
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">C</div>
        <div>
          <h2>Call_China</h2>
          <span>AI Calling Platform</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">WORKSPACE</p>

        <NavLink to="/" end className="nav-item">
          <span>▦</span> Overview
        </NavLink>

        <NavLink to="/calls" className="nav-item">
          <span>◷</span> Call History
        </NavLink>
       
      <NavLink to="/leads" className="nav-item">
  <span>♙</span> Leads
</NavLink>


        <p className="menu-label">PREFERENCES</p>

        <NavLink to="/settings" className="nav-item">
          <span>⚙</span> Settings
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="agent-status">
          <span className="status-dot"></span>
          <div>
            <strong>AI Agent</strong>
            <small>Calling system active</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
*/



import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">C</div>

        <div>
          <h2>Call_China</h2>
          <span>AI Calling Platform</span>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">WORKSPACE</p>

        <NavLink to="/" end className="nav-item">
          <span>▦</span> Overview
        </NavLink>

        <NavLink to="/calls" className="nav-item">
          <span>◷</span> Call History
        </NavLink>

        <NavLink to="/leads" className="nav-item">
          <span>♙</span> Leads
        </NavLink>

        <NavLink to="/handoffs" className="nav-item">
          <span>♧</span> Human Handoff
        </NavLink>

        <p className="menu-label">PREFERENCES</p>

        <NavLink to="/settings" className="nav-item">
          <span>⚙</span> Settings
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="agent-status">
          <span className="status-dot"></span>

          <div>
            <strong>AI Agent</strong>
            <small>Calling system active</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
