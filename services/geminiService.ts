
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const generateProductDescription = async (productName: string, features: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Gere uma descrição atraente e sofisticada em português para um produto de macramê chamado "${productName}" com as seguintes características: ${features.join(', ')}. A descrição deve ser curta, focada em artesanato e decoração afetiva.`,
      config: {
        maxOutputTokens: 150,
      }
    });

    return response.text?.trim() || "Descrição artesanal feita com carinho e algodão natural.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Um toque de arte e sofisticação para o seu lar.";
  }
};
