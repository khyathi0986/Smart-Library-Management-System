
const API_BASE_URL = "http://localhost:8085/api";

export const API = {
  users: `${API_BASE_URL}/users`,
  books: `${API_BASE_URL}/books`,
  library: `${API_BASE_URL}/library`,
  smart: `${API_BASE_URL}/smart`,
};

export async function apiRequest(url, options = {}, token = "") {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? data.message || data.error || data.detail
        : data;

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return data;
}
