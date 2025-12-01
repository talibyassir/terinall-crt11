import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getMarketAnalysis = async (query: string, contextData: string) => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: You are "OmniMind", an advanced AI embedded in a high-frequency trading terminal.
      User Query: ${query}
      Current Market Data Snippet: ${contextData}
      
      Instructions:
      1. Be concise, cynical, and highly technical.
      2. Use trading jargon (liquidity, slippage, order block, delta).
      3. Format output as a raw log message.
      4. If the query is about the market, analyze the provided data snippet.`,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "SYSTEM ERROR: Neural link unstable. Retry connection.";
  }
};
