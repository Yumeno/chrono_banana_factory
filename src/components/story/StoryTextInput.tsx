'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface StoryTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function StoryTextInput({ 
  value, 
  onChange, 
  placeholder = "Enter your story text here. Describe characters, settings, and scenes in detail..." 
}: StoryTextInputProps) {
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
        />
        
        {/* Word count */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{value.length} characters</span>
          <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
        </div>

        {/* Suggestion Button - Placeholder */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-orange-200 hover:bg-orange-50"
          disabled // Placeholder - no logic yet
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Generate Suggestion (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  )
}