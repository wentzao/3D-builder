
import { GoogleGenAI, Type } from "@google/genai";
import { Challenge } from '../types';

// Use named parameter and obtain API key from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the educational persona
const SYSTEM_INSTRUCTION = `
你是一位友善、充滿活力的國小五年級數學老師。
你的目標是透過「積木堆疊」來教導學生關於「長方體與正方體」的知識，特別是體積（Volume）和表面積（Surface Area）的概念。
請使用繁體中文（臺灣用語）。語氣要鼓勵學生，並使用簡單易懂的語言。
不要直接給出答案，而是給予引導。
`;

export const generateChallenge = async (): Promise<Challenge> => {
  try {
    // Using gemini-3-pro-preview for complex math reasoning and content generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: "請給我一個適合國小五年級學生的立體圖形堆疊挑戰。目標是讓他們用單位正方體組成特定的形狀或達到特定的體積。請隨機出題，可能是組成一個長方體，或是算出體積。",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "挑戰標題，例如：堆出一個大正方體" },
            description: { type: Type.STRING, description: "詳細的挑戰說明，包含目標體積或是長寬高要求" },
            targetVolume: { type: Type.INTEGER, description: "目標所需的積木總數量（如果是自由創作則為0）" }
          },
          required: ["title", "description", "targetVolume"]
        }
      }
    });

    // Directly access the .text property from GenerateContentResponse
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        isActive: true
      };
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error generating challenge:", error);
    return {
      title: "自由練習模式",
      description: "目前 AI 老師正在休息，你可以自由練習堆疊積木，觀察不同形狀的變化！",
      targetVolume: 0,
      isActive: true
    };
  }
};

export const checkAnswer = async (currentBlocks: number, challenge: Challenge): Promise<string> => {
  try {
    // Using gemini-3-pro-preview for math reasoning and feedback
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `目前的挑戰是：${challenge.title} - ${challenge.description}。
      學生目前使用了 ${currentBlocks} 個積木。
      目標是 ${challenge.targetVolume} 個積木（如果目標是0則忽略數量檢查）。
      請給予學生一段簡短的回饋。如果數量正確，恭喜他並解釋這個形狀的體積概念。如果數量不對，給予提示（例如：還差幾個，或是太多了）。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    // Directly access the .text property
    return response.text || "老師正在思考中...";
  } catch (error) {
    console.error("Error checking answer:", error);
    return "老師連線中斷，請稍後再試。";
  }
};

export const askConcept = async (question: string): Promise<string> => {
    try {
        // Using gemini-3-pro-preview for tutoring concepts
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: question,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        // Directly access the .text property
        return response.text || "我現在有點忙，請稍後再問我喔！";
    } catch (e) {
        return "連線發生錯誤。";
    }
}
