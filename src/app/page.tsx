'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { StoryTextInput } from '@/components/story/StoryTextInput'
import { TimePointControls } from '@/components/time/TimePointControls'
import { GeneratedResults } from '@/components/results/GeneratedResults'

export default function Home() {
  // Basic state for placeholder functionality
  const [storyText, setStoryText] = useState('')

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
      <GeneratedResults />
    </div>
  )

  return (
    <AppLayout
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  )
}
