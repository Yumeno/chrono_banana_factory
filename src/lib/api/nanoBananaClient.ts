import { GoogleGenerativeAI } from '@google/generative-ai'
import { ImageGenerationRequest, GeneratedImage, ImageEditRequest, TimelineResponse, ContentPart } from '@/types'
import { getEnvironmentVariable, getEnvironmentDebugInfo } from '@/lib/env'

class NanoBananaClient {
  private readonly apiKey: string
  private readonly ai: GoogleGenerativeAI
  private lastRequestTime = 0
  private readonly rateLimitDelay = 8000 // 8 seconds between requests

  constructor() {
    // Windows環境での確実な環境変数取得
    const apiKey = this.getApiKey()
    
    if (!apiKey) {
      throw new Error(this.getDetailedErrorMessage())
    }
    this.apiKey = apiKey
    this.ai = new GoogleGenerativeAI(this.apiKey) // 正しい初期化方法
  }

  private getApiKey(): string | undefined {
    // ブラウザ環境では NEXT_PUBLIC_ プレフィックスが必要
    const isClient = typeof window !== 'undefined'
    
    let apiKey: string | undefined
    
    if (isClient) {
      // クライアントサイドでは NEXT_PUBLIC_ 版のみ利用可能
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    } else {
      // サーバーサイドでは両方試行
      apiKey = getEnvironmentVariable('GEMINI_API_KEY') || 
               getEnvironmentVariable('NEXT_PUBLIC_GEMINI_API_KEY')
    }

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

    console.log('📤 [API REQUEST] Starting image generation')
    console.log('📝 [PROMPT] Text:', request.prompt)
    
    // Check if we have images to include
    if (request.images && request.images.length > 0) {
      console.log('🖼️ [IMAGES] Sending', request.images.length, 'reference images:')
      
      // Build contents array with text prompt and images
      const contents = [
        { text: request.prompt },
        ...request.images.map((img, index) => {
          // Use base64 property for UploadedImage type
          const imageData = img.base64 || (img as any).data
          const imageName = img.name || 'unnamed'
          console.log(`  ${index + 1}. ${imageName} (${img.mimeType}, ${Math.round(imageData.length / 1024)}KB)`)
          return {
            inlineData: {
              mimeType: img.mimeType,
              data: imageData
            }
          }
        })
      ]
      
      console.log('📊 [ORDER] Final content order:')
      console.log('  1. Text prompt')
      request.images.forEach((img, i) => {
        const isWhiteBlank = img.name?.includes('white-blank')
        console.log(`  ${i + 2}. ${isWhiteBlank ? '⬜ WHITE BLANK' : '🖼️ USER IMAGE'}: ${img.name}`)
      })

      const model = this.ai.getGenerativeModel({ model: request.model })
      const response = await model.generateContent(contents)
      
      return this.parseResponse(response, request)
    } else {
      console.log('🖼️ [IMAGES] No reference images')
      const model = this.ai.getGenerativeModel({ model: request.model })
      const response = await model.generateContent(request.prompt)
      
      return this.parseResponse(response, request)
    }
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

    const model = this.ai.getGenerativeModel({ model: request.model })
    const response = await model.generateContent(contents)

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


  private parseResponse(response: any, request: ImageGenerationRequest | ImageEditRequest): GeneratedImage {
    // Log the raw response for debugging
    console.log('🔍 Raw API Response:', JSON.stringify(response, null, 2))
    
    // Handle response from GoogleGenerativeAI SDK
    const result = response.response || response
    
    if (!result) {
      throw new Error('No response data received from API')
    }

    // Try to get text content from the response
    let textContent = ''
    try {
      textContent = result.text?.() || ''
    } catch (e) {
      console.log('Could not extract text from response:', e)
    }

    // Check if response contains candidates with parts
    if (result.candidates?.[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        // Check for inline data (base64 encoded image)
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
    }

    // If no image data found, but we have text, it might be an error or different response
    if (textContent) {
      throw new Error(`API returned text instead of image: ${textContent.substring(0, 200)}`)
    }

    throw new Error('No image data found in API response. The model may not support image generation.')
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

    const model = this.ai.getGenerativeModel({ model: request.model })
    const response = await model.generateContent(request.prompt)

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
      const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
      const response = await model.generateContent('test image of a simple red dot')

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
    // Only initialize on client side to avoid hydration issues
    if (typeof window === 'undefined') {
      throw new Error('nanoBananaClient can only be used on the client side')
    }
    
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
      if (typeof window === 'undefined') return false
      return this.instance.isReady()
    } catch {
      return false
    }
  },

  validateApiKey(): { valid: boolean; message: string } {
    try {
      if (typeof window === 'undefined') {
        return { valid: false, message: 'Server-side validation not supported' }
      }
      return this.instance.validateApiKey()
    } catch {
      return { valid: false, message: 'Client initialization failed' }
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, message: 'Server-side connection test not supported' }
      }
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
      if (typeof window === 'undefined') {
        return {
          error: 'Server-side debug info not supported',
          environment: {
            platform: 'server',
            nodeEnv: process.env.NODE_ENV,
            isServer: true
          }
        }
      }
      return this.instance.getDebugInfo()
    } catch (error) {
      return {
        error: 'Failed to initialize client',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          platform: typeof window === 'undefined' ? 'server' : 'browser',
          nodeEnv: process.env.NODE_ENV,
          isServer: typeof window === 'undefined'
        }
      }
    }
  },

  getRateLimitStatus(): { canMakeRequest: boolean; waitTime: number } {
    try {
      if (typeof window === 'undefined') {
        return { canMakeRequest: false, waitTime: 0 }
      }
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