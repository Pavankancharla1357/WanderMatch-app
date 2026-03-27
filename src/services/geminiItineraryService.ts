export interface ItinerarySuggestion {
  title: string;
  description: string;
  category: string;
  estimatedCost: string;
  duration: string;
}

export interface FullItinerary {
  destination: string;
  total_estimated_budget: string;
  days: {
    day: number;
    plan: {
      time: string;
      activity: string;
      location: string;
      cost_estimate: string;
    }[];
  }[];
  tips: string[];
  packing_suggestions: string[];
}

export const generateFullItinerary = async (
  destination: string,
  days: number,
  budget: string,
  style: string,
  startLocation: string
): Promise<FullItinerary> => {
  try {
    const response = await fetch("/api/ai/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, days, budget, style, startLocation }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate full itinerary.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error generating full itinerary:", error);
    throw error;
  }
};

export const getAiItinerarySuggestions = async (
  destination: string,
  travelStyle: string,
  existingActivities: string[]
): Promise<ItinerarySuggestion[]> => {
  try {
    const response = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, travelStyle, existingActivities }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch AI suggestions from server.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error getting AI itinerary suggestions:", error);
    throw error;
  }
};
