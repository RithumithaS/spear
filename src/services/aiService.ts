import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getSpearRecommendations(context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the SPEAR AI Assistant for a cine-industry networking platform. 
      Based on the following context about a user or the platform state, provide recommendations for:
      1. Potential connections (collaborators, directors, actors)
      2. Relevant job roles
      3. Industry tips
      
      Context: ${context}
      
      Provide the response in a structured format that can be easily displayed in a UI.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return "Unable to get recommendations at this time.";
  }
}
