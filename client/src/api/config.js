export function getApiBaseUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location.hostname) {
    const { hostname, origin } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return origin;
    }
  }

  return "http://localhost:4000";
}
