import { GoogleGenAI } from "@google/genai";

/**
 * Robustly retrieves the Gemini API Key from various possible sources.
 * Checks process.env and import.meta.env for both GEMINI_API_KEY and GEMINI_API_KEY_1.
 */
export const getGeminiApiKey = (): string => {
  const sources = [
    // Node-style process.env (often injected by Vite define)
    (process as any).env?.GEMINI_API_KEY_1,
    (process as any).env?.GEMINI_API_KEY,
    (process as any).env?.VITE_GEMINI_API_KEY_1,
    (process as any).env?.VITE_GEMINI_API_KEY,
    
    // Vite-style import.meta.env
    (import.meta as any).env?.VITE_GEMINI_API_KEY_1,
    (import.meta as any).env?.VITE_GEMINI_API_KEY,
    (import.meta as any).env?.GEMINI_API_KEY_1,
    (import.meta as any).env?.GEMINI_API_KEY,
  ];

  // Find the first non-empty, non-placeholder string
  const apiKey = sources.find(s => 
    typeof s === 'string' && 
    s.trim() !== '' && 
    s !== 'AI Studio Free Tier' &&
    s !== 'undefined' &&
    s !== 'null'
  );

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure it is set in the Secrets menu as GEMINI_API_KEY.");
  }

  return apiKey.trim();
};

/**
 * Retrieves all available Gemini API Keys.
 */
export const getAllGeminiApiKeys = (): string[] => {
  const sources = [
    (process as any).env?.GEMINI_API_KEY_1,
    (process as any).env?.GEMINI_API_KEY,
    (process as any).env?.VITE_GEMINI_API_KEY_1,
    (process as any).env?.VITE_GEMINI_API_KEY,
    (import.meta as any).env?.VITE_GEMINI_API_KEY_1,
    (import.meta as any).env?.VITE_GEMINI_API_KEY,
    (import.meta as any).env?.GEMINI_API_KEY_1,
    (import.meta as any).env?.GEMINI_API_KEY,
  ];

  return Array.from(new Set(sources.filter(s => 
    typeof s === 'string' && 
    s.trim() !== '' && 
    s !== 'AI Studio Free Tier' &&
    s !== 'undefined' &&
    s !== 'null'
  ).map(s => s.trim())));
};

/**
 * Returns a fresh instance of GoogleGenAI using the best available API key.
 */
export const getGeminiInstance = (keyIndex: number = 0): GoogleGenAI => {
  const keys = getAllGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error("Gemini API Key is missing. Please ensure it is set in the Secrets menu as GEMINI_API_KEY.");
  }
  
  // Use the key at the specified index, or the last one if index is out of bounds
  const apiKey = keys[Math.min(keyIndex, keys.length - 1)];
  return new GoogleGenAI({ apiKey });
};

/**
 * A helper to execute an AI task with automatic key rotation on quota errors.
 */
export async function runWithAiRotation<T>(task: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  const keys = getAllGeminiApiKeys();
  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    try {
      const ai = getGeminiInstance(i);
      return await task(ai);
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || 
                          error?.message?.includes('Quota exceeded') ||
                          error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isQuotaError && i < keys.length - 1) {
        console.warn(`Gemini Key ${i + 1} exhausted, rotating to next key...`);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Parses complex AI error objects into simple, user-friendly messages.
 */
export const getFriendlyAiError = (error: any): string => {
  const message = error?.message || String(error);
  
  if (message.includes('429') || message.includes('Quota exceeded') || message.includes('RESOURCE_EXHAUSTED')) {
    return "AI daily limit reached. Please try again later or add another API key in Settings.";
  }
  
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return "Invalid API Key. Please check your Gemini API key in Settings.";
  }

  if (message.includes('safety') || message.includes('blocked')) {
    return "The request was blocked by AI safety filters. Please try a different prompt.";
  }

  return "AI service is temporarily unavailable. Please try again later.";
};
