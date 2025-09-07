'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StoryTextInput } from '@/components/story/StoryTextInput'
import { TimePointControls } from '@/components/time/TimePointControls'
import { GeneratedResults } from '@/components/results/GeneratedResults'
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
      
      // Prepare images array with white blank image for aspect ratio control
      console.log('📐 [ASPECT RATIO] Selected:', aspectRatio)
      const whiteBlankImageData = await getWhiteBlankImageData(aspectRatio)
      console.log('🎨 [WHITE BLANK] Generation:', whiteBlankImageData ? 
        `Success (${aspectRatioPresets[aspectRatio]?.width}x${aspectRatioPresets[aspectRatio]?.height})` : 
        'Skipped (auto mode)')
      
      const imagesForApi: UploadedImage[] = []
      
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

      const result = await nanoBananaClient.generateImage({
        prompt: finalPrompt,
        model: 'gemini-2.5-flash-image-preview',
        images: imagesForApi
      })

      console.log('✅ Generation successful:', result)

      if (result.imageUrl) {
        setGeneratedImages([result.imageUrl])
        setCurrentImageIndex(0)
        
        // Store generation metadata
        setGenerationMetadata({
          prompt: prompt.trim(),
          aspectRatio: aspectRatio,
          model: 'gemini-2.5-flash-image-preview',
          timestamp: new Date()
        })
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
      
      {/* Placeholder for image upload */}
      <div className="border-2 border-dashed border-orange-200 rounded-lg p-8 text-center text-gray-500">
        <div className="space-y-2">
          <div className="text-4xl">🖼️</div>
          <p className="text-sm font-medium">Reference Images</p>
          <p className="text-xs">Upload up to 15 images (Coming Soon)</p>
        </div>
      </div>
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
