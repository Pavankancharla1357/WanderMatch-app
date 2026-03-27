export interface MatcherUser {
  budget: string;
  style: string;
  interests: string;
  personality: string;
}

export interface MatchResult {
  compatibility_score: number;
  match_summary: string;
  common_interests: string[];
  differences: string[];
  suggested_trip_type: string;
  confidence_level: "low" | "medium" | "high";
}

export interface SoulmateResult extends MatchResult {
  soulmate_uid: string;
  soulmate_name: string;
}

export const findSoulmate = async (currentUser: MatcherUser, otherUsers: any[]): Promise<SoulmateResult> => {
  try {
    const response = await fetch("/api/ai/soulmate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentUser, otherUsers }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to find soulmate.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error finding soulmate:", error);
    throw error;
  }
};

export const matchTravelers = async (userA: MatcherUser, userB: MatcherUser): Promise<MatchResult> => {
  try {
    const response = await fetch("/api/ai/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userA, userB }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to match travelers.");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error matching travelers:", error);
    throw error;
  }
};
