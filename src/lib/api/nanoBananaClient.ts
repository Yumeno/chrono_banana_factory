import { GoogleGenAI } from '@google/genai'
import { ImageGenerationRequest, GeneratedImage, ImageEditRequest, TimelineResponse, ContentPart } from '@/types'
import { getEnvironmentVariable, getEnvironmentDebugInfo } from '@/lib/env'

class NanoBananaClient {
  private readonly apiKey: string
  private readonly ai: GoogleGenAI
  private lastRequestTime = 0
  private readonly rateLimitDelay = 8000 // 8 seconds between requests

  constructor() {
    // Windows環境での確実な環境変数取得
    const apiKey = this.getApiKey()
    
    if (!apiKey) {
      throw new Error(this.getDetailedErrorMessage())
    }
    this.apiKey = apiKey
    this.ai = new GoogleGenAI({ apiKey: this.apiKey })
  }

  private getApiKey(): string | undefined {
    // より確実な環境変数取得ユーティリティを使用
    const apiKey = getEnvironmentVariable('GEMINI_API_KEY') || 
                   getEnvironmentVariable('NEXT_PUBLIC_GEMINI_API_KEY')

    // デバッグ情報をコンソールに出力（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Enhanced API Key Detection:')
      const debugInfo = getEnvironmentDebugInfo()
      console.log(JSON.stringify(debugInfo, null, 2))
      
      if (apiKey) {
        console.log(`✅ API Key found: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`)
      } else {
        console.log('❌ No API Key found through any method')
      }
    }

    return apiKey
  }

  private getDetailedErrorMessage(): string {
    const isWindows = process.platform === 'win32'
    const baseMessage = 'GEMINI_API_KEY environment variable is required.'
    
    if (isWindows) {
      return `${baseMessage}

🔧 Windows Setup Instructions:

PowerShell (推奨):
  $env:GEMINI_API_KEY="your_api_key_here"
  npm run dev

Command Prompt:
  set GEMINI_API_KEY=your_api_key_here
  npm run dev

Or create .env.local file:
  echo GEMINI_API_KEY=your_api_key_here > .env.local
  npm run dev

🌐 Get API Key: https://aistudio.google.com/apikey`
    }

    return `${baseMessage}

Setup Instructions:
  export GEMINI_API_KEY="your_api_key_here"
  npm run dev

Or create .env.local file:
  echo "GEMINI_API_KEY=your_api_key_here" > .env.local
  npm run dev

🌐 Get API Key: https://aistudio.google.com/apikey`
  }

  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    this.validateRequest(request)
    await this.enforceRateLimit()

    const response = await this.ai.models.generateContent({
      model: request.model,
      contents: request.prompt,
    })

    return this.parseResponse(response, request)
  }

  async editImage(request: ImageEditRequest): Promise<GeneratedImage> {
    this.validateEditRequest(request)
    await this.enforceRateLimit()

    // Build contents array with text prompt and images
    const contents = [
      { text: request.prompt },
      ...request.images.map((img, index) => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data
        }
      }))
    ]

    console.log('🔍 [DEBUG] Final API request structure:')
    console.log('🔍 [DEBUG] Model:', request.model)
    console.log('🔍 [DEBUG] Contents array length:', contents.length)
    console.log('🔍 [DEBUG] Contents structure:', contents.map((item, index) => {
      if ('text' in item) {
        return `${index}: text (${item.text.length} chars)`
      } else if ('inlineData' in item) {
        return `${index}: image (${item.inlineData.mimeType}, ${item.inlineData.data.length} chars)`
      }
      return `${index}: unknown`
    }))

    const response = await this.ai.models.generateContent({
      model: request.model,
      contents: contents,
    })

    return this.parseResponse(response, request)
  }

  private validateRequest(request: ImageGenerationRequest | ImageEditRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty')
    }
    
    if (request.prompt.length > 2000) {
      throw new Error('Prompt too long (max 2000 characters)')
    }
  }

  private validateEditRequest(request: ImageEditRequest): void {
    this.validateRequest(request)
    
    if (!request.images || request.images.length === 0) {
      throw new Error('At least one image is required for editing')
    }
    
    // Note: Removed 3-image limit based on Phase 2.6 experiment
    // Actual Gemini API supports 10+ images despite hackathon documentation

    // Validate each image
    for (const image of request.images) {
      if (!image.data || !image.mimeType) {
        throw new Error('Each image must have data and mimeType')
      }
      
      const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validMimeTypes.includes(image.mimeType)) {
        throw new Error(`Unsupported image type: ${image.mimeType}`)
      }
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
  }


  private parseResponse(response: unknown, request: ImageGenerationRequest | ImageEditRequest): GeneratedImage {
    // 公式SDKのレスポンス形式に対応
    const typedResponse = response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
            inlineData?: {
              mimeType: string
              data: string
            }
          }>
        }
      }>
    }
    
    if (!typedResponse?.candidates?.[0]?.content?.parts) {
      throw new Error('Invalid API response format: missing candidates or content')
    }

    for (const part of typedResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData

        if (!mimeType || !data) {
          throw new Error('Invalid image data in API response')
        }

        const imageUrl = `data:${mimeType};base64,${data}`

        return {
          id: this.generateId(),
          imageUrl,
          prompt: request.prompt,
          model: request.model,
          createdAt: new Date(),
          metadata: {
            mimeType,
            processingTime: Date.now() - this.lastRequestTime
          }
        }
      }
    }

    throw new Error('No image data found in API response')
  }

  // Phase 2.5: Parse multi-modal response into timeline format
  private parseTimelineResponse(response: unknown, request: ImageGenerationRequest): TimelineResponse {
    
    const typedResponse = response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
            inlineData?: {
              mimeType: string
              data: string
            }
          }>
        }
      }>
    }
    
    if (!typedResponse?.candidates?.[0]?.content?.parts) {
      throw new Error('Invalid API response format: missing candidates or content')
    }

    const parts = typedResponse.candidates[0].content.parts
    const contentParts: ContentPart[] = []
    const baseTimestamp = new Date()

    parts.forEach((part, index) => {
      if (part.text) {
        contentParts.push({
          type: 'text',
          content: part.text,
          order: index,
          timestamp: new Date(baseTimestamp.getTime() + index * 1000) // 1 second apart
        })
      } else if (part.inlineData) {
        const { mimeType, data } = part.inlineData
        if (mimeType && data) {
          const imageUrl = `data:${mimeType};base64,${data}`
          contentParts.push({
            type: 'image',
            content: imageUrl,
            order: index,
            timestamp: new Date(baseTimestamp.getTime() + index * 1000)
          })
        }
      }
    })

    const textParts = contentParts.filter(p => p.type === 'text').length
    const imageParts = contentParts.filter(p => p.type === 'image').length

    const timelineResponse: TimelineResponse = {
      id: this.generateId(),
      parts: contentParts,
      prompt: request.prompt,
      createdAt: baseTimestamp,
      metadata: {
        model: request.model,
        processingTime: Date.now() - this.lastRequestTime,
        totalParts: contentParts.length,
        textParts,
        imageParts
      }
    }

    return timelineResponse
  }

  // Phase 2.5: Generate timeline-based multi-modal content
  async generateTimeline(request: ImageGenerationRequest): Promise<TimelineResponse> {
    this.validateRequest(request)
    await this.enforceRateLimit()

    const response = await this.ai.models.generateContent({
      model: request.model,
      contents: request.prompt,
    })

    return this.parseTimelineResponse(response, request)
  }

  private generateId(): string {
    const timestamp = Date.now()
    const randomPart1 = Math.random().toString(36).substr(2, 9)
    const randomPart2 = Math.random().toString(36).substr(2, 5)
    const performanceNow = performance.now().toString().replace('.', '')
    return `img_${timestamp}_${randomPart1}_${randomPart2}_${performanceNow}`
  }

  // Method to check if the client is ready
  isReady(): boolean {
    return !!this.apiKey
  }

  // Method to validate API Key format
  validateApiKey(): { valid: boolean; message: string } {
    if (!this.apiKey) {
      return { valid: false, message: 'API Key not found' }
    }

    if (this.apiKey.length < 10) {
      return { valid: false, message: 'API Key too short (likely invalid)' }
    }

    if (!this.apiKey.startsWith('AIza')) {
      return { valid: false, message: 'API Key format invalid (should start with "AIza")' }
    }

    return { valid: true, message: 'API Key format appears valid' }
  }

  // Method to test API connection
  async testConnection(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      const validation = this.validateApiKey()
      if (!validation.valid) {
        return { success: false, message: validation.message }
      }

      // Simple test request with minimal prompt
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: 'test image of a simple red dot',
      })

      // Check if response contains image data
      const testResponse = response as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              inlineData?: {
                mimeType: string
                data: string
              }
            }>
          }
        }>
      }
      if (testResponse?.candidates?.[0]?.content?.parts) {
        for (const part of testResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            return { success: true, message: 'Connection successful' }
          }
        }
      }

      return { success: false, message: 'No image data received in test response' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { 
        success: false, 
        message: `Connection failed: ${errorMessage}`, 
        details: error 
      }
    }
  }

  // Get debug information
  getDebugInfo(): Record<string, unknown> {
    const validation = this.validateApiKey()
    const rateLimitStatus = this.getRateLimitStatus()
    
    return {
      apiKeyStatus: {
        present: !!this.apiKey,
        maskedKey: this.apiKey ? `${this.apiKey.slice(0, 6)}***${this.apiKey.slice(-4)}` : 'Not found',
        validation: validation
      },
      rateLimiting: rateLimitStatus,
      client: {
        sdk: 'GoogleGenAI official SDK',
        rateLimitDelay: this.rateLimitDelay,
        lastRequestTime: this.lastRequestTime
      },
      environment: {
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV,
        isServer: typeof window === 'undefined'
      }
    }
  }

  // Method to get rate limit status
  getRateLimitStatus(): { canMakeRequest: boolean; waitTime: number } {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    const canMakeRequest = timeSinceLastRequest >= this.rateLimitDelay
    const waitTime = canMakeRequest ? 0 : this.rateLimitDelay - timeSinceLastRequest

    return { canMakeRequest, waitTime }
  }
}

// 遅延初期化でインスタンスを管理
let _nanoBananaClient: NanoBananaClient | null = null

export const nanoBananaClient = {
  // 実際の使用時に初期化
  get instance(): NanoBananaClient {
    if (!_nanoBananaClient) {
      _nanoBananaClient = new NanoBananaClient()
    }
    return _nanoBananaClient
  },

  // APIメソッドをプロキシ
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    return this.instance.generateImage(request)
  },

  async editImage(request: ImageEditRequest): Promise<GeneratedImage> {
    return this.instance.editImage(request)
  },

  async generateTimeline(request: ImageGenerationRequest): Promise<TimelineResponse> {
    return this.instance.generateTimeline(request)
  },

  isReady(): boolean {
    try {
      return this.instance.isReady()
    } catch {
      return false
    }
  },

  validateApiKey(): { valid: boolean; message: string } {
    try {
      return this.instance.validateApiKey()
    } catch {
      return { valid: false, message: 'Client initialization failed' }
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      return await this.instance.testConnection()
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  },

  getDebugInfo(): Record<string, unknown> {
    try {
      return this.instance.getDebugInfo()
    } catch (error) {
      return {
        error: 'Failed to initialize client',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          platform: process.platform,
          nodeEnv: process.env.NODE_ENV,
          isServer: typeof window === 'undefined'
        }
      }
    }
  },

  getRateLimitStatus(): { canMakeRequest: boolean; waitTime: number } {
    try {
      return this.instance.getRateLimitStatus()
    } catch {
      return { canMakeRequest: false, waitTime: 0 }
    }
  },

  // インスタンスをリセット（デバッグ用）
  reset(): void {
    _nanoBananaClient = null
  }
}