// Detect if running inside a Capacitor native app wrapper or as static client
export const getApiBaseUrl = (): string => {
  // If we have a custom environment variable configured, use it
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }

  const isLocalFile = window.location.protocol === "file:";
  const isCapacitor = (window as any).Capacitor || isLocalFile;
  
  if (isCapacitor) {
    // Return the live production cloud URL of Sunkoshi Bearing Centre
    return "https://ais-pre-675e7nojasiaf3pkrxjaj7-573851539167.asia-southeast1.run.app";
  }
  
  // Default to relative paths for normal full-stack web serving
  return "";
};

export const apiFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  let url = input;
  
  if (typeof input === "string") {
    if (input.startsWith("/api/")) {
      url = `${baseUrl}${input}`;
    }
  }
  
  return fetch(url, init);
};
