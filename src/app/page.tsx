'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StoryTextInput } from '@/components/story/StoryTextInput'
import { TimePointControls } from '@/components/time/TimePointControls'
import { GeneratedResults } from '@/components/results/GeneratedResults'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { nanoBananaClient } from '@/lib/api/nanoBananaClient'
import { getAspectRatioPromptSuffix, getWhiteBlankImageData, aspectRatioPresets } from '@/lib/utils/aspectRatioUtils'
import type { UploadedImage } from '@/types'

export default function Home() {
  // State for functionality
  const [storyText, setStoryText] = useState('')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [textResponse, setTextResponse] = useState<string | null>(null)
  const [showTextAlert, setShowTextAlert] = useState(false)
  const [generationMetadata, setGenerationMetadata] = useState<{
    prompt: string
    aspectRatio: string
    model: string
    timestamp: Date
  } | null>(null)

  // Basic image generation function
  const handleGenerate = async (prompt: string, aspectRatio: string) => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Starting image generation...')
      console.log('Prompt:', prompt)
      console.log('Aspect ratio:', aspectRatio)

      // Phase 2.7: Prepare prompt with aspect ratio suffix and white blank image
      const aspectRatioSuffix = getAspectRatioPromptSuffix(aspectRatio)
      const finalPrompt = prompt.trim() + aspectRatioSuffix
      
      // Prepare images array with uploaded images and white blank image for aspect ratio control
      console.log('📐 [ASPECT RATIO] Selected:', aspectRatio)
      const whiteBlankImageData = await getWhiteBlankImageData(aspectRatio)
      console.log('🎨 [WHITE BLANK] Generation:', whiteBlankImageData ? 
        `Success (${aspectRatioPresets[aspectRatio]?.width}x${aspectRatioPresets[aspectRatio]?.height})` : 
        'Skipped (auto mode)')
      
      // Start with uploaded images
      const imagesForApi: UploadedImage[] = [...uploadedImages]
      console.log('📤 [UPLOADED IMAGES] Using', uploadedImages.length, 'reference images')
      
      // Add white blank image as the LAST reference image if aspect ratio is selected
      if (whiteBlankImageData) {
        const whiteBlankImage: UploadedImage = {
          id: `white-blank-${aspectRatio}`,
          file: new File([], `white-blank-${aspectRatio}.png`),
          name: `white-blank-${aspectRatio}.png`,
          size: whiteBlankImageData.base64.length,
          mimeType: whiteBlankImageData.mimeType,
          base64: whiteBlankImageData.base64,
          previewUrl: '',
          uploadedAt: new Date()
        }
        imagesForApi.push(whiteBlankImage)
        console.log('✅ [WHITE BLANK] Added as last image. Total images:', imagesForApi.length)
      } else {
        console.log('⚪ [WHITE BLANK] Not added (auto mode)')
      }
      
      console.log('🔢 [IMAGE ORDER] Final sequence:')
      imagesForApi.forEach((img, index) => {
        const isWhite = img.id.startsWith('white-blank-')
        const size = `${(img.base64.length / 1024).toFixed(1)}KB`
        console.log(`  ${index + 1}. ${isWhite ? '🎨 WHITE BLANK' : '👤 USER'} - ${img.name} (${size})`)
      })

      // Use editImage if we have reference images, otherwise use generateImage
      const result = imagesForApi.length > 0
        ? await nanoBananaClient.editImage({
            prompt: finalPrompt,
            model: 'gemini-2.5-flash-image-preview',
            images: imagesForApi.map(img => ({
              data: img.base64,
              mimeType: img.mimeType
            }))
          })
        : await nanoBananaClient.generateImage({
            prompt: finalPrompt,
            model: 'gemini-2.5-flash-image-preview'
          })

      console.log('✅ Generation successful:', result)

      // Check if we got a text-only response
      if (result.metadata?.isTextOnly && result.metadata?.textResponse) {
        console.log('📝 Text-only response received')
        setTextResponse(result.metadata.textResponse)
        setShowTextAlert(true)
        // Clear any previous images
        setGeneratedImages([])
        setGenerationError(null)
      } else if (result.imageUrl) {
        setGeneratedImages([result.imageUrl])
        setCurrentImageIndex(0)
        
        // Store generation metadata
        setGenerationMetadata({
          prompt: prompt.trim(),
          aspectRatio: aspectRatio,
          model: 'gemini-2.5-flash-image-preview',
          timestamp: new Date()
        })
        
        // Clear any previous error and text response
        setGenerationError(null)
        setTextResponse(null)
        setShowTextAlert(false)
      }
    } catch (error) {
      console.error('❌ Generation failed:', error)
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Left Panel Content
  const leftPanel = (
    <div className="space-y-6 h-full">
      <StoryTextInput
        value={storyText}
        onChange={setStoryText}
      />
      
      <TimePointControls />
      
      <ImageUpload
        images={uploadedImages}
        onImagesChange={setUploadedImages}
        maxImages={15}
      />
    </div>
  )

  // Right Panel Content
  const rightPanel = (
    <div className="h-full">
      <GeneratedResults
        images={generatedImages}
        currentIndex={currentImageIndex}
        isLoading={isGenerating}
        onGenerate={handleGenerate}
        storyText={storyText}
        metadata={generationMetadata}
      />
      
      {/* Text Response Alert Popup */}
      {showTextAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-md"
             style={{
               animation: 'slideDown 0.3s ease-out',
               '@keyframes slideDown': {
                 from: { transform: 'translateY(-100%)', opacity: 0 },
                 to: { transform: 'translateY(0)', opacity: 1 }
               }
             }}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-800">画像が生成されませんでした</p>
                  <p className="text-sm text-amber-700 mt-1">
                    APIからテキストのみが返されました。
                    詳細は下記のテキストレスポンスをご確認ください。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTextAlert(false)}
                className="text-amber-600 hover:text-amber-800 ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Response Details (Collapsible) */}
      {textResponse && (
        <div className="mt-4">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4 text-blue-600 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-blue-700">💬 APIからのテキストレスポンス</span>
              </div>
            </summary>
            <div className="mt-2 p-4 bg-white border border-blue-200 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{textResponse}</pre>
            </div>
          </details>
        </div>
      )}

      {/* Error Display */}
      {generationError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">❌ {generationError}</p>
        </div>
      )}
    </div>
  )

  return (
    <AppLayout
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  )
}
