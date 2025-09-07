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
  onGenerateSuggestion?: (mode: 'story' | 'video') => Promise<void>
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
  const [enhanceMode, setEnhanceMode] = useState<'story' | 'video'>('story')
  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700">
          📝 Story Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
          rows={6}
          disabled={isGeneratingSuggestion}
        />
        
        {/* Word count */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{value.length} characters</span>
          <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
        </div>

        {/* Error display */}
        {suggestionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{suggestionError}</p>
          </div>
        )}

        {/* Mode Selection Radio Buttons */}
        <div className="flex gap-4 justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="enhanceMode"
              value="video"
              checked={enhanceMode === 'video'}
              onChange={(e) => setEnhanceMode('video')}
              className="text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Video Scene</span>
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