/*
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { getCalls, makeOutboundCall } from "../services/CallService";
import "../styles/Dashboard.css";

function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [callMessage, setCallMessage] = useState("");
  const [callError, setCallError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCalls();
      setCalls(data);
    } catch (err) {
      setError(err.message || "Failed to load calls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Existing inbound and outbound call records
  const inboundCalls = calls.filter(
    (call) => call.direction !== "outbound"
  );

  const outboundCalls = calls.filter(
    (call) => call.direction === "outbound"
  );

  const totalCalls = calls.length;

  const completedCalls = calls.filter(
    (call) => call.status === "completed"
  ).length;

  const averageDuration = totalCalls
    ? Math.round(
        calls.reduce(
          (sum, call) => sum + (call.duration || 0),
          0
        ) / totalCalls
      )
    : 0;

  const formatDuration = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  // Phone number validation
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d+]/g, "");
    setPhoneNumber(value);
    setCallMessage("");
    setCallError("");
  };

  const isValidIndianNumber = /^\+91[6-9]\d{9}$/.test(phoneNumber);

  // Make outbound call
  const handleOutboundCall = async (e) => {
    e.preventDefault();

    if (!isValidIndianNumber || calling) return;

    try {
      setCalling(true);
      setCallMessage("");
      setCallError("");

      const result = await makeOutboundCall(phoneNumber);

      setCallMessage(
        result.message || "Call initiated successfully!"
      );

      setPhoneNumber("");

      await loadDashboard();
    } catch (err) {
      setCallError(
        err.message || "Unable to make the call."
      );
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="dashboard">

      {/* WELCOME SECTION *}
      <div className="welcome-section">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Monitor your AI calling activity and performance.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* CALL STATISTICS *}
      <div className="stats-grid">
        <StatCard
          title="Total Calls"
          value={loading ? "..." : totalCalls}
          subtitle="Calls in loaded history"
          icon="📞"
        />

        <StatCard
          title="Inbound Calls"
          value={loading ? "..." : inboundCalls.length}
          subtitle="Calls received"
          icon="📥"
        />

        <StatCard
          title="Outbound Calls"
          value={loading ? "..." : outboundCalls.length}
          subtitle="Calls placed by your agent"
          icon="📤"
        />

        <StatCard
          title="Completed Calls"
          value={loading ? "..." : completedCalls}
          subtitle="Successfully completed"
          icon="✓"
        />

        <StatCard
          title="Average Duration"
          value={loading ? "..." : formatDuration(averageDuration)}
          subtitle="Average across loaded calls"
          icon="◷"
        />
      </div>

      {/* OUTBOUND CALL SECTION *}
      <div className="outbound-section">
        <div className="outbound-heading">
          <div>
            <span className="outbound-label">
              OUTBOUND CALLING
            </span>

            <h2>Make a Call</h2>

            <p>
              Enter an Indian mobile number to call a customer.
            </p>
          </div>

          <div className="outbound-icon">📞</div>
        </div>

        <form
          className="outbound-form"
          onSubmit={handleOutboundCall}
        >
          <div className="phone-input-group">
            <label htmlFor="outbound-phone">
              Customer Phone Number
            </label>

            <input
              id="outbound-phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={13}
              disabled={calling}
            />

            {phoneNumber && !isValidIndianNumber && (
              <small className="phone-error">
                Enter a valid Indian number with +91.
              </small>
            )}
          </div>

          <button
            type="submit"
            className="outbound-call-btn"
            disabled={!isValidIndianNumber || calling}
          >
            {calling ? "Calling..." : "📞 Call Customer"}
          </button>
        </form>

        {callMessage && (
          <div className="outbound-notice">
            <span>✓</span>
            {callMessage}
          </div>
        )}

        {callError && (
          <div className="dashboard-error">
            {callError}
          </div>
        )}

        <div className="outbound-notice">
          <span>ℹ</span>
          Enter a valid Indian mobile number with +91 to start an outbound call.
        </div>
      </div>

      {/* RECENT CALLS *}
      <div className="recent-section">
        <div className="section-heading">
          <div>
            <h2>Recent Calls</h2>
            <p>
              Latest activity from your AI phone agent
            </p>
          </div>

          <Link to="/calls">
            View All Calls →
          </Link>
        </div>

        {loading ? (
          <p className="empty-state">
            Loading calls...
          </p>
        ) : calls.length === 0 ? (
          <p className="empty-state">
            No calls available yet.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Caller</th>
                  <th>Direction</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {calls.slice(0, 5).map((call) => (
                  <tr key={call._id}>
                    <td>
                      {call.callerNumber || "Unknown"}
                    </td>

                    <td>
                      <span
                        className={`direction-badge ${
                          call.direction === "outbound"
                            ? "outbound"
                            : "inbound"
                        }`}
                      >
                        {call.direction === "outbound"
                          ? "↗ Outbound"
                          : "↙ Inbound"}
                      </span>
                    </td>

                    <td>
                      {formatDate(call.startedAt)}
                    </td>

                    <td>
                      {formatDuration(call.duration)}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${call.status}`}
                      >
                        {call.status}
                      </span>
                    </td>

                    <td>
                      <Link to={`/calls/${call._id}`}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
*/


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";

import {
  getCalls,
  makeOutboundCall,
  getHandoffRequests,
} from "../services/CallService";

import "../styles/Dashboard.css";

function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [handoffSummary, setHandoffSummary] = useState({
    pending: 0,
    assigned: 0,
    completed: 0,
  });

  const [handoffError, setHandoffError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [callMessage, setCallMessage] = useState("");
  const [callError, setCallError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    setHandoffError("");

    const [callsResult, handoffResult] = await Promise.allSettled([
      getCalls(),
      getHandoffRequests(),
    ]);

    if (callsResult.status === "fulfilled") {
      setCalls(callsResult.value);
    } else {
      setError(
        callsResult.reason?.message || "Failed to load calls."
      );
    }

    if (handoffResult.status === "fulfilled") {
      const requests = handoffResult.value.requests;

      setHandoffSummary({
        pending: requests.filter(
          (request) => request.status === "pending"
        ).length,

        assigned: requests.filter(
          (request) => request.status === "assigned"
        ).length,

        completed: requests.filter(
          (request) => request.status === "completed"
        ).length,
      });
    } else {
      setHandoffError(
        handoffResult.reason?.message ||
          "Failed to load handoff summary."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const inboundCalls = calls.filter(
    (call) => call.direction !== "outbound"
  );

  const outboundCalls = calls.filter(
    (call) => call.direction === "outbound"
  );

  const totalCalls = calls.length;

  const completedCalls = calls.filter(
    (call) => call.status === "completed"
  ).length;

  const averageDuration = totalCalls
    ? Math.round(
        calls.reduce(
          (sum, call) => sum + (call.duration || 0),
          0
        ) / totalCalls
      )
    : 0;

  const formatDuration = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d+]/g, "");
    setPhoneNumber(value);
    setCallMessage("");
    setCallError("");
  };

  const isValidIndianNumber = /^\+91[6-9]\d{9}$/.test(phoneNumber);

  const handleOutboundCall = async (e) => {
    e.preventDefault();

    if (!isValidIndianNumber || calling) return;

    try {
      setCalling(true);
      setCallMessage("");
      setCallError("");

      const result = await makeOutboundCall(phoneNumber);

      setCallMessage(
        result.message || "Call initiated successfully!"
      );

      setPhoneNumber("");

      await loadDashboard();
    } catch (err) {
      setCallError(
        err.message || "Unable to make the call."
      );
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Monitor your AI calling activity and performance.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">{error}</div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total Calls"
          value={loading ? "..." : totalCalls}
          subtitle="Calls in loaded history"
          icon="📞"
        />

        <StatCard
          title="Inbound Calls"
          value={loading ? "..." : inboundCalls.length}
          subtitle="Calls received"
          icon="📥"
        />

        <StatCard
          title="Outbound Calls"
          value={loading ? "..." : outboundCalls.length}
          subtitle="Calls placed by your agent"
          icon="📤"
        />

        <StatCard
          title="Completed Calls"
          value={loading ? "..." : completedCalls}
          subtitle="Successfully completed"
          icon="✓"
        />

        <StatCard
          title="Average Duration"
          value={loading ? "..." : formatDuration(averageDuration)}
          subtitle="Average across loaded calls"
          icon="◷"
        />
      </div>

      {/* HUMAN HANDOFF SUMMARY */}

      <section className="dashboard-handoff">
        <div className="dashboard-handoff-heading">
          <div>
            <h2>Human Handoff</h2>
            <p>
              Manage customer callback requests from your AI agent.
            </p>
          </div>

          <Link to="/handoffs">
            View All Requests →
          </Link>
        </div>

        <div className="dashboard-handoff-grid">
          <div className="dashboard-handoff-item pending">
            <span>Pending Requests</span>
            <strong>
              {loading ? "..." : handoffSummary.pending}
            </strong>
          </div>

          <div className="dashboard-handoff-item assigned">
            <span>Assigned Requests</span>
            <strong>
              {loading ? "..." : handoffSummary.assigned}
            </strong>
          </div>

          <div className="dashboard-handoff-item completed">
            <span>Completed Requests</span>
            <strong>
              {loading ? "..." : handoffSummary.completed}
            </strong>
          </div>
        </div>

        {handoffError && (
          <div className="dashboard-handoff-error">
            {handoffError}
          </div>
        )}
      </section>

      {/* OUTBOUND CALL SECTION */}

      <div className="outbound-section">
        <div className="outbound-heading">
          <div>
            <span className="outbound-label">
              OUTBOUND CALLING
            </span>

            <h2>Make a Call</h2>

            <p>
              Enter an Indian mobile number to call a customer.
            </p>
          </div>

          <div className="outbound-icon">📞</div>
        </div>

        <form
          className="outbound-form"
          onSubmit={handleOutboundCall}
        >
          <div className="phone-input-group">
            <label htmlFor="outbound-phone">
              Customer Phone Number
            </label>

            <input
              id="outbound-phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={13}
              disabled={calling}
            />

            {phoneNumber && !isValidIndianNumber && (
              <small className="phone-error">
                Enter a valid Indian number with +91.
              </small>
            )}
          </div>

          <button
            type="submit"
            className="outbound-call-btn"
            disabled={!isValidIndianNumber || calling}
          >
            {calling ? "Calling..." : "📞 Call Customer"}
          </button>
        </form>

        {callMessage && (
          <div className="outbound-notice">
            <span>✓</span>
            {callMessage}
          </div>
        )}

        {callError && (
          <div className="dashboard-error">{callError}</div>
        )}

        <div className="outbound-notice">
          <span>ℹ</span>
          Enter a valid Indian mobile number with +91 to start an outbound call.
        </div>
      </div>

      {/* RECENT CALLS */}

      <div className="recent-section">
        <div className="section-heading">
          <div>
            <h2>Recent Calls</h2>
            <p>
              Latest activity from your AI phone agent
            </p>
          </div>

          <Link to="/calls">
            View All Calls →
          </Link>
        </div>

        {loading ? (
          <p className="empty-state">Loading calls...</p>
        ) : calls.length === 0 ? (
          <p className="empty-state">
            No calls available yet.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Caller</th>
                  <th>Direction</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {calls.slice(0, 5).map((call) => (
                  <tr key={call._id}>
                    <td>
                      {call.callerNumber || "Unknown"}
                    </td>

                    <td>
                      <span
                        className={`direction-badge ${
                          call.direction === "outbound"
                            ? "outbound"
                            : "inbound"
                        }`}
                      >
                        {call.direction === "outbound"
                          ? "↗ Outbound"
                          : "↙ Inbound"}
                      </span>
                    </td>

                    <td>{formatDate(call.startedAt)}</td>

                    <td>{formatDuration(call.duration)}</td>

                    <td>
                      <span
                        className={`status-badge ${call.status}`}
                      >
                        {call.status}
                      </span>
                    </td>

                    <td>
                      <Link to={`/calls/${call._id}`}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
