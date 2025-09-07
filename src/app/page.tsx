'use client'

import { useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StoryTextInput } from '@/components/story/StoryTextInput'
import { TimePointControls } from '@/components/time/TimePointControls'
import { GeneratedResults } from '@/components/results/GeneratedResults'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { nanoBananaClient } from '@/lib/api/nanoBananaClient'
import { suggestionGenerator } from '@/lib/api/suggestionGenerator'
import { getAspectRatioPromptSuffix, getWhiteBlankImageData, aspectRatioPresets } from '@/lib/utils/aspectRatioUtils'
import { TimeMode, TimeUnit, timeUnitToEnglish } from '@/types/timeControl'
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
  const [imageCount, setImageCount] = useState(1)
  const [generationProgress, setGenerationProgress] = useState<{
    current: number
    total: number
    message: string
  } | null>(null)
  const [generationMetadata, setGenerationMetadata] = useState<{
    prompt: string
    aspectRatio: string
    model: string
    timestamp: Date
  } | null>(null)
  
  // Time control state
  const [timeControlState, setTimeControlState] = useState<{
    mode: TimeMode
    value: number
    unit: TimeUnit
    imageCount: number
  }>({
    mode: TimeMode.SCENE_END,
    value: 0,
    unit: 'minutes',
    imageCount: 1
  })
  
  // Suggestion state
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  // Multiple image generation function
  const handleGenerate = async (prompt: string, aspectRatio: string) => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedImages([]) // Clear previous images
    setCurrentImageIndex(0)
    setTextResponse(null)
    setShowTextAlert(false)

    try {
      console.log('🎬 Starting image generation...')
      console.log('Prompt:', prompt)
      console.log('Aspect ratio:', aspectRatio)
      console.log('Number of images:', imageCount)

      // Build prompt with time control instructions based on time mode
      let timeControlSuffix = ''
      const { mode, value, unit } = timeControlState
      const unitText = timeUnitToEnglish[unit]
      
      switch (mode) {
        case TimeMode.CURRENT_ONLY:
          // 【現在時点のみ】 - No suffix
          timeControlSuffix = ''
          break
          
        case TimeMode.SCENE_START:
          if (imageCount === 1) {
            // 【シーンの最初、1枚の場合】
            timeControlSuffix = '\nGenerate the initial image of the above story or scene.'
          } else {
            // 【シーンの最初、n枚の場合】
            timeControlSuffix = `\nGenerate each ${imageCount} separate and independent images of the above story or scene starting from the beginning, including initial stages.`
          }
          break
          
        case TimeMode.SCENE_END:
          if (imageCount === 1) {
            // 【シーンの最後まで、1枚の場合】
            timeControlSuffix = '\nGenerate the final image of the above story or scene.'
          } else {
            // 【シーンの最後まで、n枚の場合】
            timeControlSuffix = `\nGenerate each ${imageCount} separate and independent images of the above story or scene in sequence, including intermediate stages.`
          }
          break
          
        case TimeMode.CUSTOM_FUTURE:
          if (imageCount === 1) {
            // 【正の数値、1枚の場合】
            timeControlSuffix = `\nDepict ${value} ${unitText} after the above story or scene.`
          } else {
            // 【正の数値、n枚の場合】
            // 各時点を具体的に計算して列挙
            const interval = value / (imageCount - 1)
            const timePoints: string[] = []
            for (let i = 0; i < imageCount; i++) {
              const timePoint = Math.round(interval * i * 100) / 100
              const timeText = timePoint % 1 === 0 ? timePoint.toString() : timePoint.toFixed(2).replace(/\.?0+$/, '')
              if (i === 0) {
                timePoints.push('time 0 (now)')
              } else {
                timePoints.push(`${timeText} ${unitText} later`)
              }
            }
            const timePointsList = timePoints.join(', ')
            timeControlSuffix = `\nGenerate each ${imageCount} distinct, separate, and independent images, showing the scene at the following intervals: ${timePointsList}. Each image should be a unique, standalone visualization.`
          }
          break
          
        case TimeMode.CUSTOM_PAST:
          const absValue = Math.abs(value)
          if (imageCount === 1) {
            // 【負の数値、1枚の場合】
            timeControlSuffix = `\nImagine and generate the scene ${absValue} ${unitText} before the above story or scene.`
          } else {
            // 【負の数値、n枚の場合】
            // 各時点を具体的に計算して列挙（過去から現在へ）
            const interval = absValue / (imageCount - 1)
            const timePoints: string[] = []
            for (let i = 0; i < imageCount; i++) {
              const timePoint = Math.round((absValue - interval * i) * 100) / 100
              const timeText = timePoint % 1 === 0 ? timePoint.toString() : timePoint.toFixed(2).replace(/\.?0+$/, '')
              if (timePoint === 0) {
                timePoints.push('present moment')
              } else {
                timePoints.push(`${timeText} ${unitText} before`)
              }
            }
            const timePointsList = timePoints.join(', ')
            timeControlSuffix = `\nGenerate each ${imageCount} distinct, separate, and independent images, showing the scene at the following intervals: ${timePointsList}. Each image should be a unique, standalone visualization.`
          }
          break
      }
      
      console.log('⏰ [TIME CONTROL] Mode:', mode, 'Value:', value, 'Unit:', unit, 'Images:', imageCount)
      console.log('📝 [TIME SUFFIX]:', timeControlSuffix)

      // Phase 2.7: Prepare prompt with time control and aspect ratio suffix
      const aspectRatioSuffix = getAspectRatioPromptSuffix(aspectRatio)
      const finalPrompt = prompt.trim() + timeControlSuffix + aspectRatioSuffix
      
      console.log('📝 [FINAL PROMPT]:', finalPrompt)
      
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

      // Single API call with prompt containing the image count
      setGenerationProgress({
        current: 1,
        total: 1,
        message: `Generating ${imageCount} image${imageCount > 1 ? 's' : ''}...`
      })

      console.log(`🖼️ Requesting ${imageCount} image(s) from API`)

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

      console.log(`✅ Generation result:`, result)

      // Clear progress
      setGenerationProgress(null)

      // Check if we got a text-only response
      if (result && 'metadata' in result && result.metadata?.isTextOnly && result.metadata?.textResponse) {
        console.log('📝 Text-only response received')
        setTextResponse(result.metadata.textResponse)
        setShowTextAlert(true)
      } else if (Array.isArray(result)) {
        // Handle multiple images
        console.log(`🎨 Received ${result.length} images from API`)
        const imageUrls = result.map(img => img.imageUrl)
        setGeneratedImages(imageUrls)
        
        // Store generation metadata
        setGenerationMetadata({
          prompt: prompt.trim(),
          aspectRatio: aspectRatio,
          model: 'gemini-2.5-flash-image-preview',
          timestamp: new Date()
        })
        setTextResponse(null)
        setShowTextAlert(false)
      } else if (result && 'imageUrl' in result && result.imageUrl) {
        // Handle single image
        setGeneratedImages([result.imageUrl])
        
        // Store generation metadata
        setGenerationMetadata({
          prompt: prompt.trim(),
          aspectRatio: aspectRatio,
          model: 'gemini-2.5-flash-image-preview',
          timestamp: new Date()
        })
        setTextResponse(null)
        setShowTextAlert(false)
      }
    } catch (error) {
      console.error('❌ Generation failed:', error)
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
      setGenerationProgress(null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle suggestion generation
  const handleGenerateSuggestion = useCallback(async (mode: 'story' | 'video') => {
    setIsGeneratingSuggestion(true)
    setSuggestionError(null)
    
    try {
      console.log('🎯 [SUGGESTION] Starting generation')
      console.log('📝 [SUGGESTION] Current text:', storyText.length, 'chars')
      console.log('🖼️ [SUGGESTION] Uploaded images:', uploadedImages.length)
      console.log('🎬 [SUGGESTION] Mode:', mode)
      
      // Generate suggestion using the generator
      const response = await suggestionGenerator.generate(
        {
          currentText: storyText,
          images: uploadedImages,
          mode: mode === 'video' ? 'scene' : 'story'
        },
        nanoBananaClient
      )
      
      if (response.success && response.suggestion) {
        console.log('✅ [SUGGESTION] Generated successfully')
        setStoryText(response.suggestion)
        setSuggestionError(null)
      } else {
        throw new Error(response.error || 'Failed to generate suggestion')
      }
    } catch (error) {
      console.error('❌ [SUGGESTION] Generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestion'
      setSuggestionError(errorMessage)
      
      // Clear error after 5 seconds
      setTimeout(() => setSuggestionError(null), 5000)
    } finally {
      setIsGeneratingSuggestion(false)
    }
  }, [storyText, uploadedImages])

  // Left Panel Content
  const leftPanel = (
    <div className="space-y-6 h-full">
      <StoryTextInput
        value={storyText}
        onChange={setStoryText}
        onGenerateSuggestion={handleGenerateSuggestion}
        isGeneratingSuggestion={isGeneratingSuggestion}
        suggestionError={suggestionError}
      />
      
      <ImageUpload
        images={uploadedImages}
        onImagesChange={setUploadedImages}
        maxImages={15}
      />
    </div>
  )

  // Right Panel Content
  const rightPanel = (
    <div className="h-full space-y-4">
      <TimePointControls 
        imageCount={imageCount}
        onImageCountChange={setImageCount}
        onTimeControlChange={useCallback((params) => {
          setTimeControlState(params)
          // Update imageCount from time control
          setImageCount(params.imageCount)
        }, [])}
      />
      
      <GeneratedResults
        images={generatedImages}
        currentIndex={currentImageIndex}
        isLoading={isGenerating}
        onGenerate={handleGenerate}
        storyText={storyText}
        metadata={generationMetadata}
        onIndexChange={setCurrentImageIndex}
        generationProgress={generationProgress}
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
