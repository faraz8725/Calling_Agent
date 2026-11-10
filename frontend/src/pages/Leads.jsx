/*
import { useEffect, useState } from "react";

import { getLeads, addLead } from "../services/LeadService";
import { makeOutboundCall } from "../services/CallService";

import "../styles/Leads.css";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [callingId, setCallingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    notes: "",
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      await addLead(formData);

      setMessage("Lead added successfully!");

      setFormData({
        name: "",
        mobile: "",
        email: "",
        address: "",
        notes: "",
      });

      await fetchLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCall = async (lead) => {
    setError("");
    setMessage("");
    setCallingId(lead._id);

    try {
      const result = await makeOutboundCall(lead.mobile);

      setMessage(
        result.message || `Calling ${lead.name}...`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1>Lead Management</h1>
          <p>Add leads and connect with them using your AI calling agent.</p>
        </div>

        <div className="leads-count">
          <span>Total Leads</span>
          <strong>{leads.length}</strong>
        </div>
      </div>

      {message && <div className="leads-success">{message}</div>}
      {error && <div className="leads-error">{error}</div>}

      <section className="lead-form-card">
        <div className="section-heading">
          <div>
            <h2>Add New Lead</h2>
            <p>Enter customer details to save a new lead.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lead-form">
          <div className="lead-form-grid">
            <div className="lead-field">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="lead-field">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+919876543210"
                pattern="\+91[6-9][0-9]{9}"
                title="Enter a valid Indian number with +91"
                required
              />
            </div>

            <div className="lead-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>

            <div className="lead-field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>

            <div className="lead-field lead-notes-field">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information..."
                rows="3"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "+ Add Lead"}
          </button>
        </form>
      </section>

      <section className="leads-table-card">
        <div className="section-heading">
          <div>
            <h2>All Leads</h2>
            <p>Manage your saved customer leads.</p>
          </div>
        </div>

        {loading ? (
          <p className="leads-empty">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="leads-empty">No leads added yet.</p>
        ) : (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="lead-name">{lead.name}</td>
                    <td>{lead.mobile}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.address || "—"}</td>
                    <td>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="lead-call-button"
                        onClick={() => handleCall(lead)}
                        disabled={callingId !== null}
                      >
                        {callingId === lead._id
                          ? "Calling..."
                          : "Call Lead"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Leads;
*/





import { useEffect, useState } from "react";

import { getLeads, addLead } from "../services/LeadService";
import { makeOutboundCall } from "../services/CallService";

import "../styles/Leads.css";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [callingId, setCallingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    notes: "",
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      await addLead(formData);

      setMessage("Lead added successfully!");

      setFormData({
        name: "",
        mobile: "",
        email: "",
        address: "",
        notes: "",
      });

      await fetchLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCall = async (lead) => {
    setError("");
    setMessage("");
    setCallingId(lead._id);

    try {
      // Send both mobile number and lead name
      const result = await makeOutboundCall(
        lead.mobile,
        lead.name
      );

      setMessage(
        result.message || `Calling ${lead.name}...`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1>Lead Management</h1>
          <p>Add leads and connect with them using your AI calling agent.</p>
        </div>

        <div className="leads-count">
          <span>Total Leads</span>
          <strong>{leads.length}</strong>
        </div>
      </div>

      {message && <div className="leads-success">{message}</div>}
      {error && <div className="leads-error">{error}</div>}

      <section className="lead-form-card">
        <div className="section-heading">
          <div>
            <h2>Add New Lead</h2>
            <p>Enter customer details to save a new lead.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lead-form">
          <div className="lead-form-grid">
            <div className="lead-field">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="lead-field">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+919876543210"
                pattern="\+91[6-9][0-9]{9}"
                title="Enter a valid Indian number with +91"
                required
              />
            </div>

            <div className="lead-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>

            <div className="lead-field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>

            <div className="lead-field lead-notes-field">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information..."
                rows="3"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "+ Add Lead"}
          </button>
        </form>
      </section>

      <section className="leads-table-card">
        <div className="section-heading">
          <div>
            <h2>All Leads</h2>
            <p>Manage your saved customer leads.</p>
          </div>
        </div>

        {loading ? (
          <p className="leads-empty">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="leads-empty">No leads added yet.</p>
        ) : (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="lead-name">{lead.name}</td>
                    <td>{lead.mobile}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.address || "—"}</td>
                    <td>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="lead-call-button"
                        onClick={() => handleCall(lead)}
                        disabled={callingId !== null}
                      >
                        {callingId === lead._id
                          ? "Calling..."
                          : "Call Lead"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Leads;
