/**
 * Helper to generate options for TanStack Query hooks that require authentication.
 */
export function getAuthOptions() {
  const token = localStorage.getItem("ecm_token");
  if (!token) return {};
  
  return {
    request: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  };
}

/**
 * Returns the API base URL (empty string in dev — proxy handles it, or explicit in prod)
 */
export function getApiBase(): string {
  return "";
}
