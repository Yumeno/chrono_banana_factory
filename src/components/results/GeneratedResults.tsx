'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'
import { MigratedComponentTest } from '@/components/test/MigratedComponentTest'

interface GeneratedResultsProps {
  // Placeholder props for future integration
  images?: string[]
  currentIndex?: number
  isLoading?: boolean
}

export function GeneratedResults({
  images = [],
  currentIndex = 0,
  isLoading = false
}: GeneratedResultsProps) {
  const hasImages = images.length > 0
  const totalImages = images.length

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
            disabled // Placeholder - no generation logic yet
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            🎬 Generate Scene
          </Button>
        </div>

        {/* Metadata Display - Placeholder */}
        {hasImages && (
          <div className="pt-2 border-t border-orange-100">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Generation Details
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <p>Prompt: (Generated prompt will appear here)</p>
                <p>Model: Gemini 2.5 Flash Image Preview</p>
                <p>Time: Just now</p>
              </div>
            </details>
          </div>
        )}

        {/* Migration Test Panel - Development Only */}
        <div className="pt-4 border-t border-orange-100">
          <MigratedComponentTest />
        </div>
      </CardContent>
    </Card>
  )
}