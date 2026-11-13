
import { useCallback, useEffect, useState } from "react";
import {
  getHandoffRequests,
  updateHandoffRequest,
} from "../services/CallService";

import "../styles/HumanHandoff.css";

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString();
}

function HandoffCard({ request, onUpdated }) {
  const [status, setStatus] = useState(request.status || "pending");
  const [assignedTo, setAssignedTo] = useState(
    request.assignedTo || ""
  );
  const [notes, setNotes] = useState(request.notes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (status === "assigned" && !assignedTo.trim()) {
      setError("Enter the representative's name before assigning.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await updateHandoffRequest(request._id, {
        status,
        assignedTo: assignedTo.trim(),
        notes: notes.trim(),
      });

      setMessage("Request updated successfully.");
      onUpdated();
    } catch (err) {
      setError(err.message || "Unable to update request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="handoff-card">
      <div className="handoff-card-top">
        <div>
          <span className="handoff-request-label">
            CALLBACK REQUEST
          </span>

          <h3>{request.leadName || "Unknown Customer"}</h3>

          <a
            className="handoff-phone"
            href={`tel:${request.phoneNumber}`}
          >
            {request.phoneNumber}
          </a>
        </div>

        <span
          className={`handoff-status ${request.status || "pending"}`}
        >
          {request.status || "pending"}
        </span>
      </div>

      <div className="handoff-info-grid">
        <div>
          <span>Call Direction</span>
          <strong>
            {request.direction === "inbound"
              ? "Inbound"
              : "Outbound"}
          </strong>
        </div>

        <div>
          <span>Request Date</span>
          <strong>{formatDate(request.createdAt)}</strong>
        </div>
      </div>

      <div className="handoff-reason">
        <span>Reason for handoff</span>
        <p>{request.reason || "No reason provided."}</p>
      </div>

      <div className="handoff-edit-grid">
        <div className="handoff-field">
          <label htmlFor={`status-${request._id}`}>
            Request Status
          </label>

          <select
            id={`status-${request._id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="handoff-field">
          <label htmlFor={`assigned-${request._id}`}>
            Assigned Representative
          </label>

          <input
            id={`assigned-${request._id}`}
            type="text"
            placeholder="Enter representative name"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="handoff-field handoff-notes-field">
        <label htmlFor={`notes-${request._id}`}>
          Follow-up Notes
        </label>

        <textarea
          id={`notes-${request._id}`}
          rows="3"
          placeholder="Add follow-up details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={saving}
        />
      </div>

      {message && (
        <div className="handoff-success">{message}</div>
      )}

      {error && (
        <div className="handoff-error">{error}</div>
      )}

      <div className="handoff-card-footer">
        <span className="handoff-room">
          Room: {request.roomName || "N/A"}
        </span>

        <button
          type="button"
          className="handoff-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </article>
  );
}

function HumanHandoff() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHandoffRequests();
      setRequests(data.requests);
    } catch (err) {
      setError(err.message || "Failed to load handoff requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const pendingCount = requests.filter(
    (item) => item.status === "pending"
  ).length;

  const assignedCount = requests.filter(
    (item) => item.status === "assigned"
  ).length;

  const completedCount = requests.filter(
    (item) => item.status === "completed"
  ).length;

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((item) => item.status === filter);

  return (
    <div className="handoff-page">
      <div className="handoff-page-heading">
        <div>
          <span className="handoff-eyebrow">CUSTOMER SUPPORT</span>
          <h1>Human Handoff</h1>
          <p>
            Manage callback requests created by your AI calling agent.
          </p>
        </div>

        <button
          className="handoff-refresh-btn"
          onClick={loadRequests}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="handoff-stats">
        <div className="handoff-stat">
          <span>Pending Requests</span>
          <strong>{loading ? "..." : pendingCount}</strong>
        </div>

        <div className="handoff-stat">
          <span>Assigned Requests</span>
          <strong>{loading ? "..." : assignedCount}</strong>
        </div>

        <div className="handoff-stat">
          <span>Completed Requests</span>
          <strong>{loading ? "..." : completedCount}</strong>
        </div>

        <div className="handoff-stat">
          <span>Total Requests</span>
          <strong>{loading ? "..." : requests.length}</strong>
        </div>
      </div>

      <div className="handoff-list-section">
        <div className="handoff-list-heading">
          <div>
            <h2>Callback Requests</h2>
            <p>Review and update customer follow-ups.</p>
          </div>

          <select
            className="handoff-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <div className="handoff-error handoff-page-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="handoff-empty">
            Loading handoff requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="handoff-empty">
            <span>♧</span>
            <h3>No handoff requests found</h3>
            <p>
              Requests created by your AI agent will appear here.
            </p>
          </div>
        ) : (
          <div className="handoff-request-list">
            {filteredRequests.map((request) => (
              <HandoffCard
                key={request._id}
                request={request}
                onUpdated={loadRequests}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HumanHandoff;
