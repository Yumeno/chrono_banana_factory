'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, SkipForward } from 'lucide-react'
import { TimeMode, TimeUnit, getTimeModeFromValue } from '@/types/timeControl'

interface TimePointControlsProps {
  imageCount?: number
  onImageCountChange?: (count: number) => void
  onTimeControlChange?: (params: {
    mode: TimeMode
    value: number
    unit: TimeUnit
    imageCount: number
  }) => void
}

export function TimePointControls({
  imageCount = 1,
  onImageCountChange,
  onTimeControlChange
}: TimePointControlsProps) {
  // Local state management
  const [isCurrentOnlyChecked, setIsCurrentOnlyChecked] = useState(false)
  const [isSceneEndChecked, setIsSceneEndChecked] = useState(true) // Default ON
  const [timeValue, setTimeValue] = useState(0)
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes')
  const [localImageCount, setLocalImageCount] = useState(imageCount)
  const [isImageCountDisabled, setIsImageCountDisabled] = useState(false)

  // Sync external imageCount with local state
  useEffect(() => {
    setLocalImageCount(imageCount)
  }, [imageCount])

  // Notify parent of state changes (excluding onTimeControlChange from deps to prevent infinite loop)
  useEffect(() => {
    const mode = getTimeModeFromValue(timeValue, isCurrentOnlyChecked, isSceneEndChecked)
    onTimeControlChange?.({
      mode,
      value: timeValue,
      unit: timeUnit,
      imageCount: localImageCount
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentOnlyChecked, isSceneEndChecked, timeValue, timeUnit, localImageCount])

  // Handle "Current time point only" checkbox
  const handleCurrentOnlyChange = (checked: boolean) => {
    setIsCurrentOnlyChecked(checked)
    if (checked) {
      setIsSceneEndChecked(false)
      setTimeValue(0)
      setLocalImageCount(1)
      setIsImageCountDisabled(true)
      onImageCountChange?.(1)
    } else {
      setIsImageCountDisabled(false)
    }
  }

  // Handle "Until end of scene" checkbox
  const handleSceneEndChange = (checked: boolean) => {
    setIsSceneEndChecked(checked)
    if (checked) {
      setIsCurrentOnlyChecked(false)
      setTimeValue(0)
      setIsImageCountDisabled(false)
    }
  }

  // Handle time value changes (slider or numeric input)
  const handleTimeValueChange = (value: number | string) => {
    // Handle string input from text field
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    
    setTimeValue(numValue)
    if (numValue !== 0) {
      setIsCurrentOnlyChecked(false)
      setIsSceneEndChecked(false)
      setIsImageCountDisabled(false)
    } else if (!isCurrentOnlyChecked) {
      // Auto-check "Scene End" when returning to 0
      setIsSceneEndChecked(true)
    }
  }

  // Handle image count changes
  const handleImageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setLocalImageCount(value)
      onImageCountChange?.(value)
    }
  }

  // Determine current mode for display
  const currentMode = getTimeModeFromValue(timeValue, isCurrentOnlyChecked, isSceneEndChecked)
  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          ⏰ Time Point Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Mode Selection - Now Functional */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currentOnly"
              checked={isCurrentOnlyChecked}
              onChange={(e) => handleCurrentOnlyChange(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-300"
            />
            <label htmlFor="currentOnly" className="text-sm text-gray-700 cursor-pointer">
              Current time point only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sceneEnd"
              checked={isSceneEndChecked}
              onChange={(e) => handleSceneEndChange(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-300"
            />
            <label htmlFor="sceneEnd" className="text-sm text-gray-700 cursor-pointer">
              Until end of scene
            </label>
          </div>
        </div>

        {/* Custom Time Input - Now Functional */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Custom time offset (supports negative values & decimals)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={timeValue}
              onChange={(e) => handleTimeValueChange(e.target.value)}
              className="flex-1"
              placeholder="0"
              min="-999"
              max="999"
              step="0.1"
            />
            <Select 
              value={timeUnit} 
              onValueChange={(value) => setTimeUnit(value as TimeUnit)}
            >
              <SelectTrigger className="w-24 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="seconds">sec</SelectItem>
                <SelectItem value="minutes">min</SelectItem>
                <SelectItem value="hours">hrs</SelectItem>
                <SelectItem value="days">days</SelectItem>
                <SelectItem value="years">yrs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Time slider for visual control */}
          <div className="mt-2">
            <input
              type="range"
              min="-120"
              max="120"
              value={timeValue}
              onChange={(e) => handleTimeValueChange(e.target.value)}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
              step="1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-120 (Past)</span>
              <span>0 (Now)</span>
              <span>120 (Future)</span>
            </div>
          </div>
        </div>

        {/* Image Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Number of images
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={localImageCount}
              onChange={handleImageCountChange}
              disabled={isImageCountDisabled}
              min="1"
              max="10"
              className={`w-20 ${isImageCountDisabled ? 'bg-gray-100' : ''}`}
            />
            <span className="text-xs text-gray-500">
              {isImageCountDisabled ? 'Fixed to 1' : 'Max: 10'}
            </span>
          </div>
        </div>

        {/* Status Display */}
        <div className="pt-2 border-t border-orange-100">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Mode: {(() => {
                switch (currentMode) {
                  case TimeMode.CURRENT_ONLY: return 'Current Only'
                  case TimeMode.SCENE_END: return 'Scene End'
                  case TimeMode.CUSTOM_FUTURE: return 'Future'
                  case TimeMode.CUSTOM_PAST: return 'Past'
                  default: return 'Unknown'
                }
              })()}
            </Badge>
            {timeValue !== 0 && (
              <Badge variant="outline" className="border-orange-300">
                {timeValue > 0 ? '+' : ''}{timeValue} {timeUnit}
              </Badge>
            )}
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              {localImageCount} image{localImageCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}