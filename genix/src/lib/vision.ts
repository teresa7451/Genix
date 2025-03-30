import { OpenAIImageResponse, ImageGenerationRequest } from '../types';

// Get Genix Vision API configuration from environment variables
const VISION_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.gptsapi.net/v1";
const VISION_API_KEY = process.env.OPENAI_API_KEY || "sk-kGB0cbc0c9b992c1dd4025ab9b02049d8ae2d843159wJZPr";

export async function generateImageWithVisionAI(request: ImageGenerationRequest): Promise<string> {
  try {
    if (!VISION_API_KEY) {
      throw new Error('Genix Vision API key is not configured');
    }

    // Check if there's a reference image
    const hasReferenceImage = !!request.referenceImage;
    
    // Prepare the prompt
    let enhancedPrompt = request.prompt;
    
    // Enhance the prompt if there's a reference image
    if (hasReferenceImage) {
      console.log("Processing reference image for enhanced generation");
      
      // Add descriptive prefix to help AI understand what we want
      const styleWords = ["stunning", "detailed", "high quality", "professional"];
      const randomStyle = styleWords[Math.floor(Math.random() * styleWords.length)];
      
      // Enhance the prompt to make it safer and more effective
      if (request.prompt.toLowerCase().includes("style")) {
        // Handle when user mentions "style"
        enhancedPrompt = `Create a ${randomStyle} original artwork that captures the essence of: ${request.prompt}. Use creative artistic elements with expert attention to lighting, composition, and detail.`;
      } else {
        // General case handling
        enhancedPrompt = `Create a ${randomStyle} original image that represents: ${request.prompt}. Include clear visual elements and artistic details.`;
      }
      
      // Add image type hints to help AI generate specific styles
      if (request.prompt.toLowerCase().includes("portrait")) {
        enhancedPrompt += " Focus on creating a professional portrait with appropriate framing.";
      } else if (request.prompt.toLowerCase().includes("landscape")) {
        enhancedPrompt += " Create a breathtaking landscape with depth and atmosphere.";
      } else if (request.prompt.toLowerCase().includes("cartoon") || request.prompt.toLowerCase().includes("anime")) {
        enhancedPrompt += " Create a vibrant, stylized illustration with clean lines and expressive elements.";
      }
      
      console.log("Enhanced prompt for reference image:", enhancedPrompt);
    }

    // Build request body
    const requestBody: any = {
      prompt: enhancedPrompt,
      model: request.model || "dall-e-3", // Use high-quality image model
      n: 1, // Generate 1 image
      size: "1024x1024", // Image size
      response_format: "url", // Return URL format
      quality: "standard" // Image quality
    };

    // Experimental feature: If we have a reference image and API supports it, add image to API
    // Note: This depends on whether the specific API supports reference images
    // Current OpenAI API may not support this method, but we keep this code for possible future expansion
    if (hasReferenceImage && process.env.ENABLE_REFERENCE_IMAGES === 'true') {
      try {
        // Extract the actual data part from the base64 string
        let base64Data = request.referenceImage;
        if (base64Data && base64Data.includes('base64,')) {
          base64Data = base64Data.split('base64,')[1];
        }
        
        if (base64Data) {
          requestBody.reference_image = base64Data;
          console.log("Added reference image data to request");
        }
      } catch (error) {
        console.error("Error processing reference image:", error);
        // Continue processing without the reference image
      }
    }

    // Use Genix Vision AI API
    const response = await fetch(`${VISION_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VISION_API_KEY}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Genix Vision API error:', errorData);
      
      // If safety system rejects, try with a safer prompt
      if (errorData.includes("safety") || errorData.includes("policy") || errorData.includes("content filter")) {
        console.log("Retrying with a more generic prompt due to safety system rejection");
        
        // Use a more generic and safer prompt, remove any potentially problematic elements
        const safeWords = request.prompt.split(' ')
          .filter(word => !['copy', 'duplicate', 'replicate', 'reproduce', 'mimic'].includes(word.toLowerCase()))
          .slice(0, 8)
          .join(' ');
          
        const safePrompt = `Create an original artistic interpretation with the theme: ${safeWords}`;
        
        const retryResponse = await fetch(`${VISION_BASE_URL}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VISION_API_KEY}`
          },
          body: JSON.stringify({
            prompt: safePrompt,
            model: "dall-e-3",
            n: 1,
            size: "1024x1024",
            response_format: "url",
            quality: "standard"
          }),
        });
        
        if (!retryResponse.ok) {
          const retryErrorData = await retryResponse.text();
          console.error('Genix Vision API retry error:', retryErrorData);
          throw new Error(`Genix Vision API retry error: ${retryResponse.status} ${retryErrorData}`);
        }
        
        const retryData: OpenAIImageResponse = await retryResponse.json();
        const retryImageUrl = retryData.data[0]?.url;
        
        if (!retryImageUrl) {
          throw new Error('No image URL was returned from Genix Vision API retry');
        }
        
        return retryImageUrl;
      }
      
      throw new Error(`Genix Vision API error: ${response.status} ${errorData}`);
    }

    const data: OpenAIImageResponse = await response.json();
    
    // Extract image URL from response
    const imageUrl = data.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL was returned from Genix Vision API');
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with Genix Vision AI:', error);
    throw error;
  }
}