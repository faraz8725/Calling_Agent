import API from "../config/api";

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("call_china_admin_token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Fetch all leads
export const getLeads = async () => {
  const response = await fetch(`${API}/leads`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch leads.");
  }

  return data.leads || [];
};

// Add a new lead
export const addLead = async (leadData) => {
  const response = await fetch(`${API}/leads`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(leadData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add lead.");
  }

  return data.lead;
};