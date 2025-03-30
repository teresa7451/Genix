import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithVisionAI } from '../../../lib/vision';

async function generateImageWithGemini(prompt: string, apiKey: string) {
  try {
    // Important: Gemini currently doesn't directly support image generation
    // Here we'll request a text response instead of an image
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    // Build request body, asking for text describing an image
    const requestBody = {
      contents: [{
        parts: [
          { text: `I want to create an image based on this description: ${prompt}. Please provide either a URL to a relevant image that matches this description, or describe in detail what such an image would look like. If possible, include an image URL from a stock photo site.` }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        maxOutputTokens: 2048
      }
    };

    console.log('Sending request to Gemini API for image description...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data).slice(0, 300) + '...');
    
    // Try to extract an image URL from the text response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.text) {
          // Look for a possible image URL
          const urlMatch = part.text.match(/(https?:\/\/[^"\s]+\.(?:jpg|jpeg|png|gif|webp))/i);
          if (urlMatch && urlMatch[1]) {
            return {
              success: true,
              imageUrl: urlMatch[1],
              isTextGenerated: true
            };
          }
        }
      }
      
      // If no URL is found, log the response text for debugging
      const responseText = data.candidates[0].content.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text)
        .join(" ");
      
      console.log('No image URL found in Gemini response text:', responseText.substring(0, 200) + '...');
      
      // If no URL is found, use Unsplash fallback
      return {
        success: false,
        error: "No image URL found in Gemini response",
        responseText: responseText.substring(0, 100) + '...' // Save partial response text
      };
    }
    
    console.error('No valid response content from Gemini API:', data);
    throw new Error('Invalid response from Gemini API');
    
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, referenceImage, provider = 'gemini' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A valid prompt is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY || "sk-kGB0cbc0c9b992c1dd4025ab9b02049d8ae2d843159wJZPr";

    const categoryImages = {
      emotions: [
        "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=800&auto=format&fit=crop", // Sadness
        "https://images.unsplash.com/photo-1537181534458-45dcee76ae90?w=800&auto=format&fit=crop", // Crying
        "https://images.unsplash.com/photo-1584704135557-d8bf7ec1bf58?w=800&auto=format&fit=crop", // Loneliness
        "https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&auto=format&fit=crop"  // Depression
      ],
      // Meme-related images
      memes: [
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop", // Abstract art
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&auto=format&fit=crop", // Hand-drawn style
        "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?w=800&auto=format&fit=crop", // Strange faces
        "https://images.unsplash.com/photo-1598550480917-1c485268676e?w=800&auto=format&fit=crop"  // Graffiti
      ],
      // Character-related images
      characters: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop", // Masks
        "https://images.unsplash.com/photo-1551122089-4e3e72477432?w=800&auto=format&fit=crop", // Game characters
        "https://images.unsplash.com/photo-1600256697399-99034ab0738d?w=800&auto=format&fit=crop", // Cartoon style
        "https://images.unsplash.com/photo-1626891825444-57b3f81801ec?w=800&auto=format&fit=crop"  // Abstract faces
      ]
    };
    
    const allImages = [
      ...categoryImages.emotions,
      ...categoryImages.memes,
      ...categoryImages.characters
    ];
  
    if (referenceImage) {
      console.log("Reference image received, will be used for image generation when API supports it");
      if (!geminiApiKey && provider === 'gemini') {
        console.log('No Gemini API key found. Using reference image as result.');
        return NextResponse.json({ 
          imageUrl: referenceImage,
          isTest: true,
          message: "Using your reference image. API key not configured."
        });
      }
    }

    // Try to use OpenAI API to generate image
    if (provider === 'openai') {
      try {
        console.log('Starting image generation with OpenAI for prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
        
        // Add reference image information log
        if (referenceImage) {
          console.log('Reference image provided, creating enhanced prompt based on reference');
          
          // Check reference image format
          if (!referenceImage.startsWith('data:image/')) {
            console.warn('Reference image has unexpected format, this might cause issues');
          } else {
            console.log('Reference image format looks valid');
          }
          
          // Log reference image size (useful for debugging)
          const imageSizeKB = Math.round(referenceImage.length / 1000);
          console.log(`Reference image size: ~${imageSizeKB}KB`);
        }
        
        // Call Vision AI image generation function, passing reference image
        const imageUrl = await generateImageWithVisionAI({ 
          prompt, 
          referenceImage 
        });
        
        console.log('Successfully generated image with Vision AI');
        
        let responseMessage = "I've created this image just for you with Genix Vision AI. What do you think?";
        
        // If there's a reference image, customize message
        if (referenceImage) {
          responseMessage = "I've created this image inspired by your description and reference image using Genix Vision AI.";
        }
        
        return NextResponse.json({
          imageUrl,
          isAiGenerated: true,
          provider: 'openai',
          hasReferenceImage: !!referenceImage,
          message: responseMessage
        });
      } catch (error) {
        console.error('Image generation failed:', error);
        
        // Get detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error with Vision AI';
        console.error('Error details:', errorMessage);
        
        // Provide more helpful messages for specific error types
        let userErrorMessage = "Genix Vision AI failed to generate an image. Using a similar image from Unsplash instead.";
        
        if (referenceImage) {
          if (errorMessage.includes('safety') || errorMessage.includes('policy') || errorMessage.includes('content')) {
            userErrorMessage = "I couldn't generate an image based on your reference due to content safety policies. Here's a similar image from Unsplash instead.";
          } else {
            userErrorMessage = "I couldn't generate an image based on your reference. This might be due to technical limitations. Here's a similar image from Unsplash instead.";
          }
        } else if (errorMessage.includes('safety') || errorMessage.includes('policy')) {
          userErrorMessage = "Your prompt was flagged by our safety system. Here's an alternative image from Unsplash.";
        } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
          userErrorMessage = "We've hit our generation limit. Please try again later. Here's a similar image from Unsplash for now.";
        }
        
        // If Vision AI generation fails, use a fallback image
        return NextResponse.json({ 
          imageUrl: allImages[Math.floor(Math.random() * allImages.length)],
          isSimulated: true,
          failureReason: errorMessage,
          message: userErrorMessage
        });
      }
    }

    // If using Gemini or not specified, try Gemini
    if (!geminiApiKey) {
      console.log('No Gemini API key found. Using test response.');
      
      const testImageUrl = "https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&auto=format&fit=crop";
      
      return NextResponse.json({ 
        imageUrl: testImageUrl,
        isTest: true 
      });
    }

    // Try to use Gemini API to generate image
    try {
      // Prioritize using Gemini API for image generation
      console.log('Starting image generation with prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
      const geminiResult = await generateImageWithGemini(prompt, geminiApiKey);
      
      if (geminiResult.success) {
        console.log('Successfully generated image with Gemini API');
        // Check if URL is valid
        const urlPattern = /^(data:|https?:\/\/)/i;
        if (!urlPattern.test(geminiResult.imageUrl)) {
          throw new Error('Invalid image URL format returned from Genix AI');
        }
        
        return NextResponse.json({
          imageUrl: geminiResult.imageUrl,
          isAiGenerated: true,
          isTextGenerated: geminiResult.isTextGenerated || false,
          message: geminiResult.isTextGenerated 
            ? "I found this relevant image based on your description with Genix AI's help." 
            : "I've created this image just for you with Genix AI. What do you think?"
        });
      } else {
        console.log('Genix AI image generation failed, falling back to keyword-based selection:', geminiResult.error);
        // Log detailed error information
        console.error('Detailed error from Genix AI:', geminiResult.error);
        
        // Set an error message, but continue with keyword selection logic
        const errorMessage = geminiResult.error || 'Unknown Genix AI error';
        let userErrorMessage = "Genix AI failed to generate an image. Using a similar image from Unsplash instead.";
        
        // Provide more detailed messages for specific error types
        if (errorMessage.includes("API key")) {
          userErrorMessage = "API key issue: Please check your Genix AI key configuration.";
        } else if (errorMessage.includes("quota")) {
          userErrorMessage = "API quota exceeded: Your Genix AI free quota has been reached for today.";
        } else if (errorMessage.includes("model")) {
          userErrorMessage = "Model issue: The Genix AI model specified is not available or cannot process this request.";
        } else if (errorMessage.includes("permission") || errorMessage.includes("access")) {
          userErrorMessage = "Permission denied: Your account doesn't have permission to use this Genix AI feature.";
        }
        
        // Continue with keyword selection logic after failure, and add a clear failure reason
        return NextResponse.json({ 
          imageUrl: allImages[Math.floor(Math.random() * allImages.length)],
          isSimulated: true,
          failureReason: errorMessage,
          message: userErrorMessage
        });
      }
    } catch (geminiError) {
      console.error('Error with Gemini API:', geminiError instanceof Error ? geminiError.message : 'Unknown error');
      console.error('Error details:', geminiError);
      
      // Continue with keyword selection logic after error, and add a more friendly error message
      return NextResponse.json({ 
        imageUrl: allImages[Math.floor(Math.random() * allImages.length)],
        isSimulated: true,
        failureReason: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        message: "I couldn't connect to Genix AI properly. Using a similar image from Unsplash instead."
      });
    }

    // Keyword selection logic as a fallback
    try {
      const lowerPrompt = prompt.toLowerCase();
      let selectedImages = allImages;
      
      if (lowerPrompt.includes('sad') || lowerPrompt.includes('cry') || lowerPrompt.includes('tear') || 
          lowerPrompt.includes('sadness') || lowerPrompt.includes('crying') || lowerPrompt.includes('tears')) {
        selectedImages = categoryImages.emotions;
      } 
      else if (lowerPrompt.includes('meme') || lowerPrompt.includes('wojak') || lowerPrompt.includes('pepe') || 
               lowerPrompt.includes('memes') || lowerPrompt.includes('funny')) {
        selectedImages = categoryImages.memes;
      }
      else if (lowerPrompt.includes('character') || lowerPrompt.includes('avatar') || 
               lowerPrompt.includes('persona') || lowerPrompt.includes('figure')) {
        selectedImages = categoryImages.characters;
      }

      const randomIndex = Math.floor(Math.random() * selectedImages.length);
      const imageUrl = selectedImages[randomIndex];

      return NextResponse.json({ 
        imageUrl: imageUrl,
        isSimulated: true,
        hasReferenceImage: !!referenceImage,
        message: "Generated image based on your prompt using AI technology."
      });
    } catch (unsplashError) {
      console.error('Error with image selection:', unsplashError);

      const randomIndex = Math.floor(Math.random() * allImages.length);
      return NextResponse.json({ 
        imageUrl: allImages[randomIndex],
        isSimulated: true,
        isFallback: true,
        message: "Generated creative image with AI technology."
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 