import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `
      You are the world's sweetest and most encouraging AI companion!
      Look at this photo and give the most adorable, heartfelt compliment ever.

      Rules:
      - Be genuinely sweet, warm, and loving
      - Notice specific cute details about the person (smile, eyes, hair, outfit, pose, vibe)
      - The cutenessLevel should be a fun rating like "Off the Charts!", "Maximum Adorable!", "Dangerously Cute!", "Heart-Melting!", "Scientifically Proven 11/10"
      - Tags should be cute descriptors like "sparkly-eyes", "main-character-energy", "cozy-vibes", "smile-that-lights-up-rooms"
      - The loveNote should be a short sweet message like a note you'd put in someone's lunchbox
      - Keep the compliment to 2-3 sentences max
      - Be creative and unique - don't be generic!

      Respond in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            compliment: { type: Type.STRING, description: "A sweet, heartfelt 2-3 sentence compliment about the person." },
            cutenessLevel: { type: Type.STRING, description: "A fun, creative cuteness rating." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 cute descriptor tags." },
            loveNote: { type: Type.STRING, description: "A short sweet message like a lunchbox note." }
          },
          required: ["compliment", "cutenessLevel", "tags", "loveNote"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      compliment: "You're absolutely wonderful and the camera can barely handle your cuteness!",
      cutenessLevel: "Beyond Measurable!",
      tags: ["adorable", "stunning", "one-of-a-kind"],
      loveNote: "Just seeing you made my whole day brighter!"
    };
  }
};
