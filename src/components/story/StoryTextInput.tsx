'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'
import type { UploadedImage } from '@/types'

interface StoryTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onGenerateSuggestion?: (mode: 'story' | 'video' | 'moment') => Promise<void>
  isGeneratingSuggestion?: boolean
  suggestionError?: string | null
}

export function StoryTextInput({ 
  value, 
  onChange, 
  placeholder = "Enter your story text here. Describe characters, settings, and scenes in detail...",
  onGenerateSuggestion,
  isGeneratingSuggestion = false,
  suggestionError = null
}: StoryTextInputProps) {
  const [enhanceMode, setEnhanceMode] = useState<'story' | 'video' | 'moment'>('story')
  
  // サンプルアイデア
  const sampleIdeas = [
    { label: "🐱 Cat Adventure", text: "A curious orange cat discovers a magical portal in the garden that leads to a world made entirely of yarn and catnip" },
    { label: "🚀 Space Journey", text: "An astronaut floating in space sees Earth from above, with auroras dancing across the poles and city lights twinkling below" },
    { label: "🌸 Cherry Blossom", text: "A serene Japanese garden in full cherry blossom bloom, with petals gently falling onto a koi pond" },
    { label: "🏰 Fantasy Castle", text: "A majestic castle on a floating island in the clouds, with waterfalls cascading into the sky below" },
    { label: "🌊 Ocean Depths", text: "Deep underwater scene with bioluminescent jellyfish illuminating ancient ruins, colorful coral reefs and schools of tropical fish" },
    { label: "🎭 Cyberpunk City", text: "Neon-lit cyberpunk cityscape at night with flying cars, holographic advertisements, and rain-slicked streets reflecting colorful lights" }
  ]
  
  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700">
          📝 Story Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px] resize-none pt-6"
            rows={6}
            disabled={isGeneratingSuggestion}
          />
          {/* Word count - positioned at top-left inside textarea */}
          <div className="absolute top-1 left-2 text-xs text-gray-400">
            {value.length} chars • {value.trim() ? value.trim().split(/\s+/).length : 0} words
          </div>
        </div>
        
        {/* Quick Ideas */}
        <div className="flex flex-wrap gap-2">
          {sampleIdeas.map((idea, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onChange(idea.text)}
              className="text-xs border-gray-200 hover:bg-gray-50"
            >
              {idea.label}
            </Button>
          ))}
        </div>

        {/* Error display */}
        {suggestionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{suggestionError}</p>
          </div>
        )}

        {/* Mode Selection Radio Buttons */}
        <div className="flex gap-3 justify-center">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="enhanceMode"
              value="story"
              checked={enhanceMode === 'story'}
              onChange={(e) => setEnhanceMode('story')}
              className="text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Story</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="enhanceMode"
              value="video"
              checked={enhanceMode === 'video'}
              onChange={(e) => setEnhanceMode('video')}
              className="text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Video</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="enhanceMode"
              value="moment"
              checked={enhanceMode === 'moment'}
              onChange={(e) => setEnhanceMode('moment')}
              className="text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Moment</span>
          </label>
        </div>

        {/* Suggestion Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-orange-200 hover:bg-orange-50"
          disabled={isGeneratingSuggestion || !onGenerateSuggestion}
          onClick={() => onGenerateSuggestion?.(enhanceMode)}
        >
          {isGeneratingSuggestion ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Story Enhance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}