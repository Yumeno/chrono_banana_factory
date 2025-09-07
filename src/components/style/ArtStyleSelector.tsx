'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, ChevronDown, ChevronUp } from 'lucide-react'

export type ArtStyle = 'manual' | 'photo' | 'watercolor' | 'oil' | '3dcg' | 'anime' | 'manga' | 'figure'

interface ArtStyleSelectorProps {
  selectedStyle: ArtStyle
  onStyleChange: (style: ArtStyle) => void
}

const artStyles = [
  { value: 'manual' as ArtStyle, label: 'Manual', icon: '✏️' },
  { value: 'photo' as ArtStyle, label: 'Photo', icon: '📷' },
  { value: 'watercolor' as ArtStyle, label: 'Watercolor', icon: '🎨' },
  { value: 'oil' as ArtStyle, label: 'Oil Paint', icon: '🖼️' },
  { value: '3dcg' as ArtStyle, label: '3D CG', icon: '🎮' },
  { value: 'anime' as ArtStyle, label: 'Anime', icon: '✨' },
  { value: 'manga' as ArtStyle, label: 'Manga', icon: '💫' },
  { value: 'figure' as ArtStyle, label: 'Figure', icon: '🎪' }
]

export function ArtStyleSelector({ selectedStyle, onStyleChange }: ArtStyleSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Find current style label
  const currentStyleLabel = artStyles.find(s => s.value === selectedStyle)?.label || 'Manual'
  
  return (
    <Card className="border-purple-100">
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm text-purple-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Art Style
            <span className="text-xs text-gray-500 ml-1">({currentStyleLabel})</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
          {artStyles.map((style) => (
            <Button
              key={style.value}
              variant={selectedStyle === style.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStyleChange(style.value)}
              className={`
                text-xs h-8
                ${selectedStyle === style.value 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'border-purple-200 hover:bg-purple-50'
                }
              `}
            >
              <span className="mr-1">{style.icon}</span>
              <span>{style.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Style description */}
        <div className="mt-2 text-xs text-gray-600">
          {selectedStyle === 'manual' && 'Specify directly in prompt'}
          {selectedStyle === 'photo' && 'Realistic photographic style'}
          {selectedStyle === 'watercolor' && 'Soft watercolor painting style'}
          {selectedStyle === 'oil' && 'Rich oil painting style'}
          {selectedStyle === '3dcg' && '3D rendering style'}
          {selectedStyle === 'anime' && 'Japanese anime style'}
          {selectedStyle === 'manga' && 'Japanese manga style'}
          {selectedStyle === 'figure' && 'Miniature figure/diorama style'}
        </div>
      </CardContent>
      )}
    </Card>
  )
}