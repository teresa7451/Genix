import { ImageGenerationRequest, GeminiImageResponse } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.0-flash-exp';

export async function generateImage(request: ImageGenerationRequest): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const endpoint = `${GEMINI_API_URL}/models/${request.model || MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: request.prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.8
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data: GeminiImageResponse = await response.json();
    
    // Extract the image base64 data from the response
    const imagePart = data.candidates[0]?.content?.parts?.find(part => part.inlineData?.mimeType?.startsWith('image/'));
    
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image was generated');
    }
    
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
} 