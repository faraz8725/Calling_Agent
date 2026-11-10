/*import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCalls } from "../services/CallService";
import "../styles/CallHistory.css";

function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCalls();
      setCalls(data);
    } catch (err) {
      setError(err.message || "Unable to load call history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const filteredCalls = calls.filter((call) =>
    (call.callerNumber || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "N/A";

  const formatDuration = (seconds = 0) =>
    `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <section className="history-page">
      <div className="history-header">
        <div>
          <h1>Call History</h1>
          <p>View and manage your previous AI phone calls.</p>
        </div>

        <button onClick={loadCalls} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search caller number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>{filteredCalls.length} calls</span>
      </div>

      {loading ? (
        <p>Loading calls...</p>
      ) : error ? (
        <p className="history-error">{error}</p>
      ) : filteredCalls.length === 0 ? (
        <p className="empty-history">No calls found.</p>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Caller</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredCalls.map((call) => (
                <tr key={call._id}>
                  <td>{call.callerNumber || "Unknown"}</td>
                  <td>{formatDate(call.startedAt)}</td>
                  <td>{formatDuration(call.duration)}</td>
                  <td>
                    <span className={`status-badge ${call.status}`}>
                      {call.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/calls/${call._id}`} className="details-link">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default CallHistory; */


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCalls } from "../services/CallService";
import "../styles/CallHistory.css";

function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCalls();
      setCalls(data);
    } catch (err) {
      setError(err.message || "Unable to load call history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const inboundCalls = calls.filter(
    (call) => call.direction !== "outbound"
  );

  const outboundCalls = calls.filter(
    (call) => call.direction === "outbound"
  );

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = (call.callerNumber || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDirection =
      activeFilter === "all" ||
      (activeFilter === "inbound" &&
        call.direction !== "outbound") ||
      (activeFilter === "outbound" &&
        call.direction === "outbound");

    return matchesSearch && matchesDirection;
  });

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "N/A";

  const formatDuration = (seconds = 0) =>
    `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <section className="history-page">

      <div className="history-header">
        <div>
          <h1>Call History</h1>
          <p>View and manage your AI phone call activity.</p>
        </div>

        <button onClick={loadCalls} className="refresh-btn">
          ↻ Refresh
        </button>
      </div>

      {/* CALL FILTERS */}

      <div className="history-filters">

        <button
          className={activeFilter === "all" ? "active" : ""}
          onClick={() => setActiveFilter("all")}
        >
          All Calls
          <span>{calls.length}</span>
        </button>

        <button
          className={activeFilter === "inbound" ? "active" : ""}
          onClick={() => setActiveFilter("inbound")}
        >
          ↙ Inbound
          <span>{inboundCalls.length}</span>
        </button>

        <button
          className={activeFilter === "outbound" ? "active" : ""}
          onClick={() => setActiveFilter("outbound")}
        >
          ↗ Outbound
          <span>{outboundCalls.length}</span>
        </button>

      </div>

      {/* SEARCH */}

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search caller number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>{filteredCalls.length} calls found</span>
      </div>

      {/* CALL TABLE */}

      {loading ? (
        <p className="empty-history">Loading calls...</p>
      ) : error ? (
        <p className="history-error">{error}</p>
      ) : filteredCalls.length === 0 ? (
        <p className="empty-history">No calls found.</p>
      ) : (

        <div className="history-table-wrapper">

          <table className="history-table">

            <thead>
              <tr>
                <th>Caller</th>
                <th>Direction</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredCalls.map((call) => (

                <tr key={call._id}>

                  <td>{call.callerNumber || "Unknown"}</td>

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
                    <span className={`status-badge ${call.status}`}>
                      {call.status}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/calls/${call._id}`}
                      className="details-link"
                    >
                      View Details →
                    </Link>
                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}

export default CallHistory;
