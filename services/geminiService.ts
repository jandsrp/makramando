
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the SDK
const genAI = new GoogleGenAI(apiKey || 'MISSING_KEY');

export const generateProductDescription = async (productName: string, features: string[]): Promise<string> => {
  if (!apiKey) {
    console.error("Gemini Error: API Key is missing. Check VITE_GEMINI_API_KEY in .env.local");
    return "Um toque de arte e sofisticação para o seu lar. (Chave API não configurada)";
  }

  try {
    // Standard pattern for most Google Generative AI SDKs
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Gere uma descrição atraente em português para um produto de macramê chamado "${productName}" com as seguintes características: ${features.join(', ')}. Seja conciso e focado em artesanato.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim() || "Descrição artesanal feita com carinho e algodão natural.";
  } catch (error) {
    console.error("Gemini Service Error Details:", error);
    // Return a slightly more descriptive fall-back if it's a known error type
    return "Um toque de arte e sofisticação para o seu lar. (Erro na geração: Verifique o console)";
  }
};
