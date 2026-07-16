const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL

export const API_CONFIG = {
  GEMINI_API_KEY: GEMINI_API_KEY,
  GEMINI_API_URL: GEMINI_API_URL
};

// Edit this file to update your Gemini API key
export const updateApiKey = (newKey: string) => {
  (API_CONFIG as any).GEMINI_API_KEY = newKey;
};