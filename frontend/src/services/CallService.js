

/*
import API from "../config/api";

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("call_china_admin_token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getCalls = async () => {
  const response = await fetch(`${API}/calls`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch calls");
  }

  return Array.isArray(data) ? data : data.calls || [];
};

export const getCallById = async (id) => {
  const response = await fetch(`${API}/calls/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch call details");
  }

  return data.call || data;
};

export const makeOutboundCall = async (phoneNumber) => {
  const response = await fetch(`${API}/calls/outbound`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ phoneNumber }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to initiate outbound call"
    );
  }

  return data;
}; */


/*

import API from "../config/api";

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("call_china_admin_token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getCalls = async () => {
  const response = await fetch(`${API}/calls`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch calls");
  }

  return Array.isArray(data) ? data : data.calls || [];
};

export const getCallById = async (id) => {
  const response = await fetch(`${API}/calls/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to fetch call details"
    );
  }

  return data.call || data;
};

// Initiate outbound call with optional lead name
export const makeOutboundCall = async (phoneNumber, leadName = "") => {
  const response = await fetch(`${API}/calls/outbound`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      phoneNumber,
      leadName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to initiate outbound call"
    );
  }

  return data;
};
*/





import API from "../config/api";

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("call_china_admin_token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const readResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || fallbackMessage
    );
  }

  return data;
};

export const getCalls = async () => {
  const response = await fetch(`${API}/calls`, {
    headers: getAuthHeaders(),
  });

  const data = await readResponse(response, "Failed to fetch calls");

  return Array.isArray(data) ? data : data.calls || [];
};

export const getCallById = async (id) => {
  const response = await fetch(`${API}/calls/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await readResponse(
    response,
    "Failed to fetch call details"
  );

  return data.call || data;
};

export const makeOutboundCall = async (phoneNumber, leadName = "") => {
  const response = await fetch(`${API}/calls/outbound`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      phoneNumber,
      leadName,
    }),
  });

  return readResponse(response, "Failed to initiate outbound call");
};

// HUMAN HANDOFF APIs

export const getHandoffRequests = async () => {
  const response = await fetch(`${API}/handoffs`, {
    headers: getAuthHeaders(),
  });

  const data = await readResponse(
    response,
    "Failed to fetch handoff requests"
  );

  return {
    requests: Array.isArray(data.requests) ? data.requests : [],
    summary: data.summary || {},
  };
};

export const updateHandoffRequest = async (id, updates) => {
  const response = await fetch(`${API}/handoffs/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(updates),
  });

  return readResponse(
    response,
    "Failed to update handoff request"
  );
};
