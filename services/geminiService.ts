import { GoogleGenAI } from "@google/genai";

export const generateArchitecturalDescription = async (): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an architectural historian viewing a voxel art recreation of a magnificent illuminated mosque at night, inspired by the Al-Sabeen Mosque in Sana'a, Yemen.
      
      Describe the atmosphere of the scene. Mention the 'luminous minarets', the 'warm glow of the windows', the 'geometric harmony', and the contrast with the 'twilight mountains' in the background.
      
      Keep the tone poetic, serene, and appreciative of Islamic architecture. Max 3 sentences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "The mosque glows with a celestial warmth against the cooling twilight, a beacon of serenity constructed from light and stone.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to the architectural archives (API Key missing or invalid).";
  }
};
