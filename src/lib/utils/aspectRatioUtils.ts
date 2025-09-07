/**
 * Aspect Ratio Control Utilities
 * Uses pre-made white blank images to control Gemini API output resolution
 */

export type AspectRatio = 'auto' | '1:1' | '16:9' | '4:3' | '3:4' | '9:16'

export interface AspectRatioConfig {
  label: string
  width: number
  height: number
  filename?: string
}

export const aspectRatioPresets: Record<AspectRatio, AspectRatioConfig> = {
  'auto': {
    label: 'Auto (Default)',
    width: 1024,
    height: 1024
  },
  '1:1': {
    label: 'Square (1:1)',
    width: 1024,
    height: 1024,
    filename: 'white-1024x1024.png'
  },
  '16:9': {
    label: 'Landscape (16:9)',
    width: 1920,
    height: 1080,
    filename: 'white-1920x1080.png'
  },
  '4:3': {
    label: 'Classic (4:3)', 
    width: 1600,
    height: 1200,
    filename: 'white-1600x1200.png'
  },
  '3:4': {
    label: 'Portrait Classic (3:4)',
    width: 1200,
    height: 1600,
    filename: 'white-1200x1600.png'
  },
  '9:16': {
    label: 'Mobile Portrait (9:16)',
    width: 1080,
    height: 1920,
    filename: 'white-1080x1920.png'
  }
}


/**
 * Get aspect ratio prompt suffix for white image approach
 */
export function getAspectRatioPromptSuffix(ratio: AspectRatio): string {
  if (ratio === 'auto') {
    return '' // No suffix for auto mode
  }

  return ' Maintain the aspect ratio of the last reference white blank image.'
}

/**
 * Generate white blank canvas as base64
 */
export function generateWhiteBlankImage(width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }
  
  // Fill with white color
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  
  // Return base64 string (without data URL prefix)
  return canvas.toDataURL('image/png').split(',')[1]
}

/**
 * Load white blank image for aspect ratio control
 */
export async function getWhiteBlankImageData(ratio: AspectRatio): Promise<{ base64: string; mimeType: string } | null> {
  if (ratio === 'auto') {
    return null // No white image for auto mode
  }
  
  const config = aspectRatioPresets[ratio]
  
  try {
    // Generate white blank image using canvas
    const base64 = generateWhiteBlankImage(config.width, config.height)
    console.log(`🎨 [WHITE BLANK] Generated ${config.width}x${config.height} image (${(base64.length / 1024).toFixed(1)}KB)`)
    return {
      base64,
      mimeType: 'image/png'
    }
  } catch (error) {
    console.error('❌ [WHITE BLANK] Generation failed:', error)
    return null
  }
}

/**
 * Get aspect ratio dimensions for display
 */
export function getAspectRatioDimensions(ratio: AspectRatio) {
  return aspectRatioPresets[ratio]
}