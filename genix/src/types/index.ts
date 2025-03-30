// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Image generation types
export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  provider?: 'gemini' | 'openai';
  referenceImage?: string | null;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

// API response types
export interface GeminiImageResponse {
  candidates: {
    content: {
      parts: {
        inlineData?: {
          mimeType: string;
          data: string;
        };
        text?: string;
      }[];
    };
  }[];
}

// OpenAI image generation types
export interface OpenAIImageResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
} 