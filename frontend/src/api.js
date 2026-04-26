const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function parseResponse(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.detail || "Request failed";
    throw new Error(message);
  }
  return response.json();
}

export async function fetchTrees() {
  const response = await fetch(`${API_BASE_URL}/api/trees`);
  return parseResponse(response);
}

export async function createTree(tree) {
  const response = await fetch(`${API_BASE_URL}/api/trees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tree }),
  });
  return parseResponse(response);
}

export async function updateTree(id, tree) {
  const response = await fetch(`${API_BASE_URL}/api/trees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tree }),
  });
  return parseResponse(response);
}
