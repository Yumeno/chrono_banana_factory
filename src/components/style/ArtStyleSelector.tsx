'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

export type ArtStyle = 'manual' | 'photo' | 'watercolor' | 'oil' | '3dcg' | 'anime' | 'manga'

interface ArtStyleSelectorProps {
  selectedStyle: ArtStyle
  onStyleChange: (style: ArtStyle) => void
}

const artStyles = [
  { value: 'manual' as ArtStyle, label: 'Manual', icon: '✏️' },
  { value: 'photo' as ArtStyle, label: '写真', icon: '📷' },
  { value: 'watercolor' as ArtStyle, label: '水彩画', icon: '🎨' },
  { value: 'oil' as ArtStyle, label: '油彩画', icon: '🖼️' },
  { value: '3dcg' as ArtStyle, label: '3DCG', icon: '🎮' },
  { value: 'anime' as ArtStyle, label: 'アニメ', icon: '✨' },
  { value: 'manga' as ArtStyle, label: 'マンガ', icon: '💫' }
]

export function ArtStyleSelector({ selectedStyle, onStyleChange }: ArtStyleSelectorProps) {
  return (
    <Card className="border-purple-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Art Style
        </CardTitle>
      </CardHeader>
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
          {selectedStyle === 'manual' && 'プロンプトで直接指定'}
          {selectedStyle === 'photo' && 'リアルな写真風'}
          {selectedStyle === 'watercolor' && '柔らかい水彩画風'}
          {selectedStyle === 'oil' && '重厚な油彩画風'}
          {selectedStyle === '3dcg' && '3Dレンダリング風'}
          {selectedStyle === 'anime' && '日本のアニメ風'}
          {selectedStyle === 'manga' && '日本のマンガ風'}
        </div>
      </CardContent>
    </Card>
  )
}