import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.LLM_API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const getAgentAnalysis = async (
  marketQuestion: string,
  tweetContent: string,
  yesPrice: number
) => {
  try {
    const prompt = `
      You are an expert crypto market analyst AI agent for a prediction market platform called "Linkol".
      
      Context:
      A user is looking at a prediction market based on a tweet.
      Market Question: "${marketQuestion}"
      KOL Tweet: "${tweetContent}"
      Current Probability of YES: ${yesPrice * 100}%
      
      Task:
      Provide a concise, witty, and data-driven comment (max 50 words) analyzing whether the user should bet YES or NO based on the tweet's sentiment and the current price. 
      Adopt a slightly cynical but knowledgeable "crypto native" persona.
    `;

    const response = await ai.models.generateContent({
      model: 'claude-haiku-4-5',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Agent analysis failed:', error);
    return 'The markets are volatile, and my circuits are hazy. DYOR (Do Your Own Research).';
  }
};
