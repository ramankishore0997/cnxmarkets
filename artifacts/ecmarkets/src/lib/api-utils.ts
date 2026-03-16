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
