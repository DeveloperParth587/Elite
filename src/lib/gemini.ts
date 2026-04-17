import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFurnitureImage(params: {
  type: string;
  dimensions: string;
  material: string;
  finish: string;
  storage: string;
  style: string;
  color: string;
}) {
  const prompt = `Create a high-fidelity, photorealistic interior design render of a custom furniture piece.
Type: ${params.type}
Dimensions: ${params.dimensions}
Material: ${params.material}
Finish: ${params.finish}
Storage: ${params.storage}
Style: ${params.style}
Color: ${params.color}

The image should look like a professional photography from an interior design magazine. Modern lighting, clean background.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ text: prompt }],
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
}

export async function generateBOM(params: {
  type: string;
  dimensions: string;
  material: string;
  finish: string;
  storage: string;
  style: string;
  color: string;
}) {
  const prompt = `Generate a realistic Bill of Materials (BOM) for the following furniture design:
Type: ${params.type}
Dimensions: ${params.dimensions}
Material: ${params.material}
Finish: ${params.finish}
Storage: ${params.storage}
Style: ${params.style}
Color: ${params.color}

Return a JSON array of objects, each containing:
- item: Name of the part or material
- material: Spécific material used
- qty: Numeric quantity
- unit: Unit of measurement (e.g., pcs, sqft, meters, kg)
- estimated_cost_per_unit: A sample numeric value for cost estimation.

Only return the JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            material: { type: Type.STRING },
            qty: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            estimated_cost_per_unit: { type: Type.NUMBER }
          },
          required: ["item", "material", "qty", "unit", "estimated_cost_per_unit"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
