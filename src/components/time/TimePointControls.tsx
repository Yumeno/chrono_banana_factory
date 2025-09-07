'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, SkipForward } from 'lucide-react'

interface TimePointControlsProps {
  // Placeholder props for future state integration
  isCurrentOnlyChecked?: boolean
  isSceneEndChecked?: boolean
  timeValue?: number
  timeUnit?: string
  imageCount?: number
}

export function TimePointControls({
  isCurrentOnlyChecked = false,
  isSceneEndChecked = true,
  timeValue = 0,
  timeUnit = 'minutes',
  imageCount = 1
}: TimePointControlsProps) {
  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          ⏰ Time Point Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Mode Selection - Placeholder */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currentOnly"
              checked={isCurrentOnlyChecked}
              disabled // Placeholder - no logic yet
              className="rounded border-orange-300"
            />
            <label htmlFor="currentOnly" className="text-sm text-gray-700">
              Current time point only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sceneEnd"
              checked={isSceneEndChecked}
              disabled // Placeholder - no logic yet
              className="rounded border-orange-300"
            />
            <label htmlFor="sceneEnd" className="text-sm text-gray-700">
              Until end of scene
            </label>
          </div>
        </div>

        {/* Custom Time Input - Placeholder */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Custom time offset
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={timeValue}
              disabled // Placeholder - no logic yet
              className="flex-1"
              placeholder="0"
            />
            <Select value={timeUnit} disabled>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">sec</SelectItem>
                <SelectItem value="minutes">min</SelectItem>
                <SelectItem value="hours">hrs</SelectItem>
                <SelectItem value="days">days</SelectItem>
                <SelectItem value="years">yrs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Image Count - Placeholder */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Number of images
          </label>
          <Input
            type="number"
            value={imageCount}
            min="1"
            max="10"
            disabled // Placeholder - no logic yet
            className="w-20"
          />
        </div>

        {/* Status Display */}
        <div className="pt-2 border-t border-orange-100">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Mode: {isCurrentOnlyChecked ? 'Current Only' : 'Scene End'}
            </Badge>
            {timeValue !== 0 && (
              <Badge variant="outline" className="border-orange-300">
                {timeValue > 0 ? '+' : ''}{timeValue} {timeUnit}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}