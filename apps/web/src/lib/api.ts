
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ApiHealth = {
  status: string;
  project: string;
  version: string;
};

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getApiHealth(): Promise<ApiHealth> {
  return apiRequest<ApiHealth>("/health");
}

export function getApiInfo() {
  return apiRequest<{
    project: string;
    api_version: string;
    modules: string[];
  }>("/api/v1");
}
