/*
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCallById } from "../services/CallService";
import "../styles/CallDetails.css";
function CallDetails() {
  const { id } = useParams();

  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCall = async () => {
      try {
        const data = await getCallById(id);
        setCall(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCall();
  }, [id]);

  if (loading) return <p>Loading call details...</p>;
  if (error) return <p>{error}</p>;
  if (!call) return <p>Call not found.</p>;

  return (
    <div>
      <Link to="/calls">← Back to Call History</Link>

      <h1>Call Details</h1>
      <p>Caller: {call.callerNumber || "Unknown"}</p>
      <p>Status: {call.status}</p>
      <p>Duration: {call.duration} seconds</p>
      <p>Room: {call.roomName}</p>

      <h2>Transcript</h2>

      {call.transcript?.map((item, index) => (
        <div key={index}>
          <strong>
            {item.role === "user" ? "Caller" : "AI Agent"}
          </strong>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  );
}

export default CallDetails; */




import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCallById } from "../services/CallService";
import "../styles/CallDetails.css";

function CallDetails() {
  const { id } = useParams();

  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCall = async () => {
      try {
        const data = await getCallById(id);
        setCall(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCall();
  }, [id]);

  if (loading) {
    return <div className="call-details-loading">Loading call details...</div>;
  }

  if (error) {
    return <div className="call-details-error">{error}</div>;
  }

  if (!call) {
    return <div className="call-details-loading">Call not found.</div>;
  }

  const direction = call.direction === "outbound" ? "Outbound" : "Inbound";

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="call-details-page">
      <div className="call-details-header">
        <div>
          <Link to="/calls" className="back-link">
            ← Back to Call History
          </Link>
          <h1>Call Details</h1>
          <p>View call information and conversation transcript.</p>
        </div>

        <span className={`direction-badge ${direction.toLowerCase()}`}>
          {direction} Call
        </span>
      </div>

      <div className="call-info-grid">
        <div className="call-info-card">
          <span>Customer Number</span>
          <h3>{call.callerNumber || "Unknown"}</h3>
        </div>

        <div className="call-info-card">
          <span>Status</span>
          <h3>{call.status || "Unknown"}</h3>
        </div>

        <div className="call-info-card">
          <span>Duration</span>
          <h3>{formatDuration(call.duration)}</h3>
        </div>

        <div className="call-info-card">
          <span>Direction</span>
          <h3>{direction}</h3>
        </div>

        <div className="call-info-card">
          <span>Started At</span>
          <h3>{formatDate(call.startedAt)}</h3>
        </div>

        <div className="call-info-card">
          <span>Ended At</span>
          <h3>{formatDate(call.endedAt)}</h3>
        </div>
      </div>

      <section className="call-transcript-section">
        <h2>Conversation Transcript</h2>

        {call.transcript?.length > 0 ? (
          <div className="transcript-list">
            {call.transcript.map((item, index) => (
              <div
                key={index}
                className={`transcript-message ${item.role === "assistant" ? "assistant" : "user"}`}
              >
                <div className="transcript-role">
                  {item.role === "user" ? "Customer" : "AI Agent"}
                </div>

                <p>{item.content}</p>

                {item.timestamp && (
                  <span className="transcript-time">
                    {formatDate(item.timestamp)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-transcript">No transcript available for this call.</p>
        )}
      </section>
    </div>
  );
}

export default CallDetails;
