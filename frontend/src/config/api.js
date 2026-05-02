const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const explicitApiUrl = trimTrailingSlash((import.meta.env.VITE_API_URL || "").trim());
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocalHostname = ["localhost", "127.0.0.1", "::1"].includes(hostname);

export const API_URL = explicitApiUrl || (isLocalHostname ? "http://localhost:8000" : "");
export const hasApiUrl = Boolean(API_URL);
export const missingApiUrlMessage = hasApiUrl
  ? ""
  : "Production API is not configured. Set VITE_API_URL in your frontend deployment settings.";

export const getApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

if (typeof window !== "undefined" && missingApiUrlMessage) {
  console.warn(`[CrimeAI] ${missingApiUrlMessage}`);
}
