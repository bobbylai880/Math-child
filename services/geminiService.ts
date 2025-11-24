import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getEncouragement = async (isCorrect: boolean): Promise<string> => {
  const ai = getClient();
  if (!ai) return isCorrect ? "太棒了！继续加油！" : "没关系，再试一次！";

  try {
    const prompt = isCorrect 
      ? "Give a short, super enthusiastic, cute compliment in Chinese for a 7-year-old child who just solved a math problem correctly. Use emojis." 
      : "Give a short, gentle, encouraging message in Chinese for a 7-year-old child who made a mistake on a math problem. Tell them it's okay to try again. Use emojis.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (isCorrect ? "太棒了！🌟" : "加油，你可以的！💪");
  } catch (error) {
    console.error("Gemini Error:", error);
    return isCorrect ? "你真聪明！🎈" : "别灰心，再来一次！🛡️";
  }
};

export const getMathExplanation = async (num1: number, num2: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "记得把个位数加起来，如果超过10，就要进位哦！";

  try {
    const prompt = `
      We are doing 2-digit addition: ${num1} + ${num2}.
      The child is stuck. Explain the "Make 10" (凑十法) concept for the ones digit simple Chinese suitable for a 1st grader.
      Example logic: If adding 8 + 5, say "8 needs 2 to become 10. Split 5 into 2 and 3..."
      Keep it short (max 2 sentences) and very cute.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "试试凑十法！比如8加2等于10...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "个位满十要向前一位进一哦！";
  }
};