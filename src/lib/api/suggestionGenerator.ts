import { UploadedImage } from '@/types'

export interface SuggestionRequest {
  currentText: string
  images: UploadedImage[]
  mode?: 'story' | 'scene' | 'moment' | 'auto'
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
- If reference images are provided:
  * USE the visual appearance of characters, objects, and backgrounds from the images
  * BUT IMAGINE new poses, expressions, and actions appropriate for each scene
  * Integrate them into the story: characters as protagonists/supporting cast, landscapes as settings/stages, props as story elements
  * Specify dynamic camera angles and compositions that enhance the narrative
  * Design appropriate lighting (time of day, mood, shadows, highlights) for each scene
  * Avoid simply describing the reference images as-is; transform them into story scenes`

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
- If reference images are provided:
  * USE the character designs and environmental elements from the images
  * BUT CREATE new dynamic poses, expressions, and movements for the video
  * Integrate them into the video: characters as actors, landscapes as locations, objects as props in action
  * Design camera work that brings the static references to life
  * Specify lighting changes (dramatic shadows, backlighting, color temperature) for cinematic effect
  * Describe how characters should move, emote, and interact in each shot`

const MOMENT_PROMPT = `# Objective:
To generate a detailed image generation prompt for a single moment/scene, based on the user's input text and reference images.

# Instructions:
Output only the core descriptive text without any prefaces, notes, questions, or explanations. Provide only the detailed description. Do not generate images. Language: English.

# Method:
Analyze the user's input text and reference images. Create a rich, detailed description of a single image that captures the essence of the user's request.

# Important:
- Focus on ONE single image/moment only
- Describe visual elements in great detail: composition, lighting, colors, textures, atmosphere
- Include specific details about characters, objects, environment, and mood
- Specify artistic style, camera angle, and visual perspective
- If reference images are provided:
  * USE the character appearances and visual styles from the images
  * BUT REIMAGINE them in new poses, expressions, and situations
  * Integrate them meaningfully: characters as subjects, environments as settings, items as focal elements
  * Create fresh compositions and camera angles that differ from the references
  * Describe specific lighting conditions (golden hour, dramatic spotlight, soft diffused light, etc.)
  * Transform static references into a dynamic, narrative moment
- Use vivid, precise language suitable for image generation
- Include details about foreground, middle ground, and background elements
- Describe the emotional tone and ambiance of the scene`

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
          model: response.model || 'gemini-2.5-flash-lite',
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
          model: 'gemini-2.5-flash-lite',
          processingTime: Date.now() - startTime
        }
      }
    }
  }
  
  /**
   * Build the complete prompt with user input
   */
  private buildPrompt(userText: string, images: UploadedImage[], mode: 'story' | 'scene' | 'moment'): string {
    // Select appropriate prompt template
    let basePrompt: string
    if (mode === 'scene') {
      basePrompt = VIDEO_SCENE_PROMPT
    } else if (mode === 'moment') {
      basePrompt = MOMENT_PROMPT
    } else {
      basePrompt = STORY_PROMPT
    }
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
      prompt += `IMPORTANT: Integrate these images meaningfully into the narrative - `
      prompt += `if they show characters, make them the protagonists or supporting cast; `
      prompt += `if they show landscapes, use them as backgrounds or settings; `
      prompt += `if they show objects, incorporate them as props or story elements. `
      prompt += `CREATIVELY REIMAGINE them with new poses, expressions, actions, camera angles, and lighting appropriate for each scene. `
      prompt += `Consider time of day, mood lighting, shadows, and atmospheric effects. `
      prompt += `DO NOT simply describe the images as they appear - transform them into dynamic narrative moments.\n\n`
    }
    
    // Add generation instruction
    prompt += `# Generate:\nNow, based on the above context, generate the appropriate text for the user.`
    
    return prompt
  }
  
  /**
   * Auto-detect whether user wants a story, scene, or moment
   */
  private detectMode(text: string): 'story' | 'scene' | 'moment' {
    const lowerText = text.toLowerCase()
    
    // Moment indicators (single image focus)
    const momentKeywords = [
      'moment', 'image', 'picture', 'portrait', 'landscape',
      'photograph', 'illustration', 'artwork', 'painting', 'single',
      'snapshot', 'capture'
    ]
    
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
    
    const momentScore = momentKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length
    
    const sceneScore = sceneKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length
    
    const storyScore = storyKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length
    
    // Determine mode based on highest score
    if (momentScore > sceneScore && momentScore > storyScore) {
      return 'moment'
    } else if (sceneScore > storyScore) {
      return 'scene'
    } else {
      return 'story'
    }
  }
}

// Export singleton instance
export const suggestionGenerator = new SuggestionGenerator()