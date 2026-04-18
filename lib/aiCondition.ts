/**
 * Utility function to verify product condition using AI via our API route.
 */
export interface AIConditionResponse {
  detectedCondition: string;
  mismatch: boolean;
  aiFailed: boolean;
}

export const checkCondition = async (
  imageUrl: string,
  selectedCondition: string
): Promise<AIConditionResponse> => {
  try {
    const response = await fetch("/api/ai/condition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, selectedCondition }),
    });

    if (!response.ok) {
      throw new Error("AI verification request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("checkCondition error:", error);
    return {
      detectedCondition: selectedCondition,
      mismatch: false,
      aiFailed: true,
    };
  }
};
