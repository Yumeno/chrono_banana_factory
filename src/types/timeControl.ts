// Time Control Types for Chrono Banana Factory

export enum TimeMode {
  CURRENT_ONLY = 'currentOnly',      // 現在時点のみ
  SCENE_START = 'sceneStart',        // シーン開始
  SCENE_END = 'sceneEnd',            // シーン最後まで (default)
  CUSTOM_FUTURE = 'customFuture',    // 未来の特定時点
  CUSTOM_PAST = 'customPast'         // 過去の特定時点
}

export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'years'

export interface TimeControlState {
  mode: TimeMode
  isCurrentOnlyChecked: boolean
  isSceneStartChecked: boolean
  isSceneEndChecked: boolean
  sliderValue: number
  numericValue: number
  timeUnit: TimeUnit
  imageCount: number
}

// Initial state
export const initialTimeControlState: TimeControlState = {
  mode: TimeMode.SCENE_END,
  isCurrentOnlyChecked: false,
  isSceneStartChecked: false,
  isSceneEndChecked: true,  // Default ON per requirements
  sliderValue: 0,
  numericValue: 0,
  timeUnit: 'minutes',
  imageCount: 1
}

// Time unit conversion to English for prompts
export const timeUnitToEnglish: Record<TimeUnit, string> = {
  seconds: 'seconds',
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  years: 'years'
}

// Helper to determine time mode from value
export function getTimeModeFromValue(value: number, isCurrentOnly: boolean, isSceneStart: boolean, isSceneEnd: boolean): TimeMode {
  if (isCurrentOnly) return TimeMode.CURRENT_ONLY
  if (isSceneStart) return TimeMode.SCENE_START
  if (isSceneEnd || value === 0) return TimeMode.SCENE_END
  if (value > 0) return TimeMode.CUSTOM_FUTURE
  return TimeMode.CUSTOM_PAST
}