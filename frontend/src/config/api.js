const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is missing in frontend environment variables");
}

export default API_BASE_URL;