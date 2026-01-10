
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generatePotteryImage(
  userPrompt: string, 
  referenceImage: { data: string; mimeType: string; } | null,
  isEdit: boolean = false
): Promise<string> {
  const baseInstructions = `
    Style: Traditional My Thien Pottery from Quang Ngai, Vietnam. 
    Characteristics: Hand-crafted, rustic terracotta or glazed stoneware. 
    Specific glaze: 'Men hỏa biến' (transforming glaze) with rich earthy tones like deep brown, emerald green, or amber.
    Details: High-quality product photography, soft natural studio lighting, simple wooden pedestal background. 
    Avoid: Plastic looks, futuristic styles, or over-perfect factory-made appearance.
  `;

  const parts: any[] = [];

  if (referenceImage) {
    parts.push({
      inlineData: {
        data: referenceImage.data,
        mimeType: referenceImage.mimeType,
      },
    });
    const editPrompt = isEdit 
      ? `Modify the provided My Thien pottery image according to: "${userPrompt}". Keep the material and lighting consistent.`
      : `Create a new My Thien style pottery piece inspired by this shape but with: "${userPrompt}".`;
    parts.push({ text: `${editPrompt} ${baseInstructions}` });
  } else {
    parts.push({ text: `Generate a photorealistic image of a My Thien pottery piece: ${userPrompt}. ${baseInstructions}` });
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
            },
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error('Image data missing in API response.');
  } catch (error) {
    console.error('Gemini Image API Error:', error);
    throw new Error('Lỗi khi kết nối với xưởng gốm AI.');
  }
}
