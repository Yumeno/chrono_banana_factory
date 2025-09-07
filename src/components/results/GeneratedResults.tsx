'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, ChevronLeft, ChevronRight, Play, Upload } from 'lucide-react'
import Image from 'next/image'

interface GeneratedResultsProps {
  // Props for image generation
  images?: string[]
  currentIndex?: number
  isLoading?: boolean
  onGenerate?: (prompt: string, aspectRatio: string) => Promise<void>
  storyText?: string
  metadata?: {
    prompt: string
    aspectRatio: string
    model: string
    timestamp: Date
    timeControlSuffix?: string
    aspectRatioSuffix?: string
  } | null
  onIndexChange?: (index: number) => void
  generationProgress?: {
    current: number
    total: number
    message: string
  } | null
  onUseAsInput?: (imageUrl: string) => void
}

export function GeneratedResults({
  images = [],
  currentIndex = 0,
  isLoading = false,
  onGenerate,
  storyText = '',
  metadata = null,
  onIndexChange,
  generationProgress = null,
  onUseAsInput
}: GeneratedResultsProps) {
  const hasImages = images.length > 0
  const totalImages = images.length
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('auto')
  const [actualImageSize, setActualImageSize] = useState<{ width: number; height: number } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Measure actual image dimensions when it loads
  useEffect(() => {
    if (hasImages && images[currentIndex]) {
      const img = new window.Image()
      img.onload = () => {
        setActualImageSize({ width: img.width, height: img.height })
        console.log('📏 [IMAGE SIZE] Actual dimensions:', img.width, 'x', img.height)
      }
      img.src = images[currentIndex]
    }
  }, [images, currentIndex, hasImages])

  // Download current image
  const handleDownload = () => {
    if (!hasImages || !images[currentIndex]) return

    const currentImage = images[currentIndex]
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `chrono-banana-${timestamp}.png`

    // Convert base64 to blob
    const base64Data = currentImage.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/png' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('💾 [DOWNLOAD] Image saved as:', filename)
  }

  return (
    <>
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700 flex items-center justify-between">
          <span>🎨 Generated Scenes</span>
          {hasImages && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {currentIndex + 1} / {totalImages}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Display Area */}
        <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {isLoading ? (
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-500">
                {generationProgress ? generationProgress.message : 'Generating image...'}
              </p>
              {generationProgress && (
                <div className="w-48 mx-auto">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {generationProgress.current} / {generationProgress.total}
                  </p>
                </div>
              )}
            </div>
          ) : hasImages ? (
            <div 
              className="relative w-full h-full cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Image
                src={images[currentIndex]}
                alt={`Generated scene ${currentIndex + 1}`}
                fill
                className="object-contain rounded-lg hover:opacity-95 transition-opacity"
              />
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Play className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500">No images generated yet</p>
              <p className="text-xs text-gray-400">Results will appear here</p>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {hasImages && totalImages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              className="border-orange-200"
              onClick={() => onIndexChange?.(currentIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => onIndexChange?.(index)}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === totalImages - 1}
              className="border-orange-200"
              onClick={() => onIndexChange?.(currentIndex + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Aspect Ratio:</span>
          <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
            <SelectTrigger className="w-32 h-8 text-sm bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="auto">Auto (Default)</SelectItem>
              <SelectItem value="1:1">1:1 Square</SelectItem>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
              <SelectItem value="4:3">4:3 Classic</SelectItem>
              <SelectItem value="3:4">3:4 Portrait</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Future Enhancement: Prompt Enhancement Toggle */}
        {/* TODO: Add checkbox for enabling prompt enhancement
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enhancePrompt"
            className="rounded border-orange-300 text-orange-500"
          />
          <label htmlFor="enhancePrompt" className="text-sm text-gray-600">
            Enhance prompt for time division
          </label>
        </div>
        
        When enabled, this could:
        - Add temporal continuity hints
        - Include scene progression keywords
        - Add "distinct frames" emphasis
        - Insert cinematographic transitions
        - Example: "cinematic sequence", "temporal progression", "evolving scene"
        */}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasImages}
            className="flex-1 border-orange-200 hover:bg-orange-50"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasImages || !onUseAsInput}
            className="flex-1 border-blue-200 hover:bg-blue-50"
            onClick={() => {
              if (hasImages && onUseAsInput) {
                onUseAsInput(images[currentIndex])
                console.log('📤 [USE AS INPUT] Image transferred to input')
              }
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Use as Input
          </Button>
          <Button
            size="sm"
            disabled={isLoading || !storyText.trim() || !onGenerate}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={() => onGenerate?.(storyText, selectedAspectRatio)}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>🎬 Generate Scene</>
            )}
          </Button>
        </div>

        {/* Metadata Display */}
        {hasImages && metadata && (
          <div className="pt-2 border-t border-orange-100">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Generation Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">User Prompt:</span>
                  <p className="text-gray-600 mt-1">{metadata.prompt}</p>
                  
                  {/* Time Control Suffix */}
                  {metadata.timeControlSuffix && (
                    <>
                      <span className="font-semibold text-blue-700 mt-2 block">Time Control (Auto-added):</span>
                      <p className="text-blue-600 mt-1 italic">{metadata.timeControlSuffix}</p>
                    </>
                  )}
                  
                  {/* Aspect Ratio Suffix */}
                  {metadata.aspectRatioSuffix && (
                    <>
                      <span className="font-semibold text-green-700 mt-2 block">Aspect Ratio (Auto-added):</span>
                      <p className="text-green-600 mt-1 italic">{metadata.aspectRatioSuffix}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Aspect Ratio:</span>
                    <span className="text-gray-600 ml-1">
                      {metadata.aspectRatio === 'auto' ? 'Auto' : metadata.aspectRatio}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Resolution:</span>
                    <span className="text-gray-600 ml-1">
                      {actualImageSize 
                        ? `${actualImageSize.width}x${actualImageSize.height}`
                        : 'Loading...'}
                    </span>
                  </div>
                  {actualImageSize && (
                    <div>
                      <span className="font-semibold text-gray-700">Actual Ratio:</span>
                      <span className="text-gray-600 ml-1">
                        {(() => {
                          const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                          const divisor = gcd(actualImageSize.width, actualImageSize.height)
                          const ratioW = actualImageSize.width / divisor
                          const ratioH = actualImageSize.height / divisor
                          // Simplify common ratios
                          if (Math.abs(ratioW / ratioH - 16/9) < 0.01) return '16:9'
                          if (Math.abs(ratioW / ratioH - 9/16) < 0.01) return '9:16'
                          if (Math.abs(ratioW / ratioH - 4/3) < 0.01) return '4:3'
                          if (Math.abs(ratioW / ratioH - 3/4) < 0.01) return '3:4'
                          if (Math.abs(ratioW / ratioH - 1) < 0.01) return '1:1'
                          return `${ratioW}:${ratioH}`
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Model:</span>
                    <span className="text-gray-600 ml-1">Gemini 2.5 Flash Image Preview</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Generated:</span>
                    <span className="text-gray-600 ml-1">
                      {new Date(metadata.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

      </CardContent>
    </Card>

    {/* Fullscreen Preview Modal */}
    {isPreviewOpen && hasImages && (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={() => setIsPreviewOpen(false)}
      >
        <div className="relative max-w-full max-h-full">
          <img
            src={images[currentIndex]}
            alt={`Generated scene ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              setIsPreviewOpen(false)
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Download button in preview */}
          <button
            className="absolute bottom-4 right-4 text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          
          {/* Image info in preview */}
          {actualImageSize && (
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 rounded-lg px-3 py-2 text-sm">
              {actualImageSize.width} × {actualImageSize.height}
            </div>
          )}
        </div>
      </div>
    )}
  </>
  )
}