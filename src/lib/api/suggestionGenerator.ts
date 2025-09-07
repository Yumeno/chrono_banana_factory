import { UploadedImage } from '@/types'

export interface SuggestionRequest {
  currentText: string
  images: UploadedImage[]
  mode?: 'story' | 'scene' | 'auto'
}

export interface SuggestionResponse {
  success: boolean
  suggestion?: string
  error?: string
  metadata?: {
    model: string
    processingTime: number
    inputTokens?: number
    outputTokens?: number
    detectedMode?: 'story' | 'scene'
  }
}

// Prompt templates for different modes
const STORY_PROMPT = `# Objective:
To generate text that users can use for creating picture books, based on their input text and images.

# Instructions:
Output only the core text without any prefaces, notes, questions, or image generation. Provide only the core text. Do not include a preface, notes, questions, or explanations. Do not generate images. Language: English.

# Method:
Analyze the user's input text and the content of their images. Create and describe a story that meets the user's requirements. 

# Important:
- Clearly define the scene breaks
- Focus on narrative flow and character development
- Describe settings, characters, and actions vividly
- If reference images are provided, incorporate their elements naturally into the story`

const VIDEO_SCENE_PROMPT = `# Objective:
To generate text that users can use for creating videos, based on their input text and images.

# Instructions:
Output only the core text without any prefaces, notes, questions, or image generation. Provide only the core text. Do not include a preface, notes, questions, or explanations. Do not generate images. Language: English.

# Method:
Analyze the user's input text and the content of their images. Create a detailed text-based storyboard that meets the user's requirements.

# Important:
- Describe the subject's acting and the camera work in concrete and detailed manner
- Include specific shot types (close-up, wide shot, pan, zoom, etc.)
- Specify camera angles and movements
- If the user requests only one scene, create a single scene with a single shot and do not switch shots
- If reference images are provided, describe how they should be used in the video`

export class SuggestionGenerator {
  /**
   * Generate suggestion based on text and images
   */
  async generate(
    request: SuggestionRequest,
    apiClient: any
  ): Promise<SuggestionResponse> {
    const startTime = Date.now()
    
    try {
      // Determine mode
      const mode = request.mode === 'auto' 
        ? this.detectMode(request.currentText)
        : request.mode || 'story'
      
      // Build the full prompt with appropriate template
      const fullPrompt = this.buildPrompt(request.currentText, request.images, mode)
      
      console.log('🎭 [SUGGESTION] Generating with mode:', mode)
      console.log('📝 [SUGGESTION] Input text length:', request.currentText.length)
      console.log('🖼️ [SUGGESTION] Number of images:', request.images.length)
      
      // Call API for text generation
      const response = await apiClient.generateSuggestion({
        prompt: fullPrompt,
        images: request.images.map(img => ({
          data: img.base64,
          mimeType: img.mimeType
        }))
      })
      
      if (!response.suggestion) {
        throw new Error('No suggestion generated')
      }
      
      return {
        success: true,
        suggestion: response.suggestion,
        metadata: {
          model: response.model || 'gemini-1.5-flash',
          processingTime: Date.now() - startTime,
          detectedMode: mode,
          ...response.metadata
        }
      }
    } catch (error) {
      console.error('❌ [SUGGESTION] Generation failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate suggestion',
        metadata: {
          model: 'gemini-1.5-flash',
          processingTime: Date.now() - startTime
        }
      }
    }
  }
  
  /**
   * Build the complete prompt with user input
   */
  private buildPrompt(userText: string, images: UploadedImage[], mode: 'story' | 'scene'): string {
    // Select appropriate prompt template
    const basePrompt = mode === 'scene' ? VIDEO_SCENE_PROMPT : STORY_PROMPT
    let prompt = basePrompt + '\n\n'
    
    // Add user context
    if (userText.trim()) {
      prompt += `# User Input:\n${userText}\n\n`
    } else {
      prompt += `# User Input:\n[No text provided - create an engaging story or scene based on the provided images, or if no images, create a sample story about a magical adventure]\n\n`
    }
    
    // Add image context if available
    if (images.length > 0) {
      prompt += `# Reference Images:\n`
      prompt += `The user has provided ${images.length} reference image(s). `
      prompt += `Please analyze these images and incorporate their elements (characters, settings, objects, mood) into the generated text. `
      prompt += `Describe how each image relates to the story or scene.\n\n`
    }
    
    // Add generation instruction
    prompt += `# Generate:\nNow, based on the above context, generate the appropriate text for the user.`
    
    return prompt
  }
  
  /**
   * Auto-detect whether user wants a story or scene
   */
  private detectMode(text: string): 'story' | 'scene' {
    const lowerText = text.toLowerCase()
    
    // Scene indicators
    const sceneKeywords = [
      'scene', 'shot', 'camera', 'film', 'video', 'storyboard',
      'action', 'close-up', 'wide shot', 'pan', 'zoom', 'cut',
      'frame', 'angle', 'cinemat', 'direct'
    ]
    
    // Story indicators
    const storyKeywords = [
      'story', 'tale', 'book', 'chapter', 'once upon',
      'narrative', 'novel', 'fairy', 'adventure', 'journey',
      'character', 'plot'
    ]
    
    const sceneScore = sceneKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length
    
    const storyScore = storyKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length
    
    // Default to story if unclear
    return sceneScore > storyScore ? 'scene' : 'story'
  }
}

// Export singleton instance
export const suggestionGenerator = new SuggestionGenerator()