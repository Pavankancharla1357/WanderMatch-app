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
      const message = error?.message || '';
      const isQuotaError = message.includes('429') || 
                          message.includes('Quota exceeded') ||
                          message.includes('RESOURCE_EXHAUSTED');
      
      const isServerError = message.includes('503') || 
                           message.includes('500') ||
                           message.includes('overloaded') ||
                           message.includes('Service Unavailable');
      
      if ((isQuotaError || isServerError) && i < keys.length - 1) {
        console.warn(`Gemini Key ${i + 1} issue (${isQuotaError ? 'Quota' : 'Server'}), rotating to next key...`);
        // Small delay before retry if it's a server error
        if (isServerError) await new Promise(r => setTimeout(r, 1000));
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
  console.error("AI Error:", error);
  const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  const lowMessage = message.toLowerCase();
  
  if (lowMessage.includes('429') || lowMessage.includes('quota') || lowMessage.includes('limit reached')) {
    return "AI daily limit reached. Please try again later or add another API key in Settings.";
  }
  
  if (lowMessage.includes('key') && (lowMessage.includes('invalid') || lowMessage.includes('not valid'))) {
    return "Invalid API Key. Please check your Gemini API key in Settings.";
  }

  if (lowMessage.includes('api key is missing')) {
    return "Gemini API Key is missing. Please set GEMINI_API_KEY in the Secrets menu (Settings > Secrets).";
  }

  if (lowMessage.includes('403') || lowMessage.includes('permission') || lowMessage.includes('access')) {
    return "Permission denied. Your API key might not have access to this AI model. Please check your Google AI Studio account.";
  }

  if (lowMessage.includes('safety') || lowMessage.includes('block')) {
    return "The request was blocked by AI safety filters. Please try a different prompt.";
  }

  if (lowMessage.includes('503') || lowMessage.includes('overloaded') || lowMessage.includes('high traffic') || lowMessage.includes('service unavailable')) {
    return "The AI service is currently overwhelmed by high traffic. Please wait 10 seconds and try again.";
  }

  if (lowMessage.includes('500') || lowMessage.includes('internal error')) {
    return "AI Internal Server Error. Please try again in a moment.";
  }

  if (lowMessage.includes('json') || lowMessage.includes('syntax') || lowMessage.includes('parse') || lowMessage.includes('invalid response format')) {
    return "AI returned an invalid response. Please try clicking the button again.";
  }

  if (lowMessage.includes('fetch') || lowMessage.includes('network') || lowMessage.includes('offline') || lowMessage.includes('failed to fetch')) {
    return "Network error. Please check your internet connection.";
  }

  if (lowMessage.includes('model') && (lowMessage.includes('not found') || lowMessage.includes('not exist'))) {
    return "The AI model is not available. Please try again later.";
  }

  return `AI service is temporarily unavailable. (Detail: ${message.slice(0, 60)}...). Please try again later.`;
};
