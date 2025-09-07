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
  const [isSceneStartChecked, setIsSceneStartChecked] = useState(false)
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
    const mode = getTimeModeFromValue(timeValue, isCurrentOnlyChecked, isSceneStartChecked, isSceneEndChecked)
    onTimeControlChange?.({
      mode,
      value: timeValue,
      unit: timeUnit,
      imageCount: localImageCount
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentOnlyChecked, isSceneStartChecked, isSceneEndChecked, timeValue, timeUnit, localImageCount])

  // Handle "Current time point only" checkbox
  const handleCurrentOnlyChange = (checked: boolean) => {
    setIsCurrentOnlyChecked(checked)
    if (checked) {
      setIsSceneStartChecked(false)
      setIsSceneEndChecked(false)
      setTimeValue(0)
      setLocalImageCount(1)
      setIsImageCountDisabled(true)
      onImageCountChange?.(1)
    } else {
      setIsImageCountDisabled(false)
    }
  }

  // Handle "Scene Start" checkbox
  const handleSceneStartChange = (checked: boolean) => {
    setIsSceneStartChecked(checked)
    if (checked) {
      setIsCurrentOnlyChecked(false)
      setIsSceneEndChecked(false)
      setTimeValue(0)
      setIsImageCountDisabled(false)
    }
  }

  // Handle "Until end of scene" checkbox
  const handleSceneEndChange = (checked: boolean) => {
    setIsSceneEndChecked(checked)
    if (checked) {
      setIsCurrentOnlyChecked(false)
      setIsSceneStartChecked(false)
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
      setIsSceneStartChecked(false)
      setIsSceneEndChecked(false)
      setIsImageCountDisabled(false)
    } else if (!isCurrentOnlyChecked && !isSceneStartChecked) {
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
  const currentMode = getTimeModeFromValue(timeValue, isCurrentOnlyChecked, isSceneStartChecked, isSceneEndChecked)
  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Time Mode Selection - Compact horizontal layout */}
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrentOnlyChecked}
              onChange={(e) => handleCurrentOnlyChange(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Standard</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isSceneStartChecked}
              onChange={(e) => handleSceneStartChange(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Scene Start</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isSceneEndChecked}
              onChange={(e) => handleSceneEndChange(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-300"
            />
            <span className="text-sm text-gray-700">Scene End</span>
          </label>
        </div>

        {/* Custom Time Controls - All in one row */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Time offset
          </label>
          <div className="flex gap-2 items-center">
            {/* Slider */}
            <input
              type="range"
              min="-120"
              max="120"
              value={timeValue}
              onChange={(e) => handleTimeValueChange(e.target.value)}
              className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
              step="1"
            />
            
            {/* Numeric Input */}
            <Input
              type="number"
              value={timeValue}
              onChange={(e) => handleTimeValueChange(e.target.value)}
              className="w-16 h-8 text-sm"
              placeholder="0"
              min="-999"
              max="999"
              step="0.1"
            />
            
            {/* Unit Selector */}
            <Select 
              value={timeUnit} 
              onValueChange={(value) => setTimeUnit(value as TimeUnit)}
            >
              <SelectTrigger className="w-20 h-8 bg-white text-sm">
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

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />
            
            {/* Image Count */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600">Images:</span>
              <Input
                type="number"
                value={localImageCount}
                onChange={handleImageCountChange}
                disabled={isImageCountDisabled}
                min="1"
                max="10"
                className={`w-12 h-8 text-sm ${isImageCountDisabled ? 'bg-gray-100' : ''}`}
              />
            </div>
          </div>
          
          {/* Range labels */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>Past</span>
            <span>Now</span>
            <span>Future</span>
          </div>
        </div>

        {/* Status Display - Compact */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-xs h-5">
            {(() => {
              switch (currentMode) {
                case TimeMode.CURRENT_ONLY: return 'Current'
                case TimeMode.SCENE_START: return 'Scene Start'
                case TimeMode.SCENE_END: return 'Scene End'
                case TimeMode.CUSTOM_FUTURE: return 'Future'
                case TimeMode.CUSTOM_PAST: return 'Past'
                default: return 'Unknown'
              }
            })()}
          </Badge>
          {timeValue !== 0 && (
            <Badge variant="outline" className="border-orange-200 text-xs h-5">
              {timeValue > 0 ? '+' : ''}{timeValue} {timeUnit}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}