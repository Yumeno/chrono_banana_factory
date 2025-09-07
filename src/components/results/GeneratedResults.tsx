'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, ChevronLeft, ChevronRight, Play } from 'lucide-react'
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
  } | null
}

export function GeneratedResults({
  images = [],
  currentIndex = 0,
  isLoading = false,
  onGenerate,
  storyText = '',
  metadata = null
}: GeneratedResultsProps) {
  const hasImages = images.length > 0
  const totalImages = images.length
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('auto')
  const [actualImageSize, setActualImageSize] = useState<{ width: number; height: number } | null>(null)

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

  return (
    <Card className="border-orange-100 h-full">
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
              <p className="text-sm text-gray-500">Generating image...</p>
            </div>
          ) : hasImages ? (
            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex]}
                alt={`Generated scene ${currentIndex + 1}`}
                fill
                className="object-contain rounded-lg"
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
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === totalImages - 1}
              className="border-orange-200"
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasImages}
            className="flex-1 border-orange-200 hover:bg-orange-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
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
                  <span className="font-semibold text-gray-700">Prompt:</span>
                  <p className="text-gray-600 mt-1">{metadata.prompt}</p>
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
  )
}