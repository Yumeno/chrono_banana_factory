'use client'

import React, { useState, useRef, useCallback } from 'react'
import { UploadedImage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  FileImage,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react'

interface ImageUploadProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  className?: string
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 15,
  className = '' 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log(`📸 [ImageUpload] Current: ${images.length} images, max: ${maxImages}`)

  const generateId = () => {
    const timestamp = Date.now()
    const randomPart1 = Math.random().toString(36).substr(2, 9)
    const randomPart2 = Math.random().toString(36).substr(2, 5)
    const performanceNow = performance.now().toString().replace('.', '')
    return `img_${timestamp}_${randomPart1}_${randomPart2}_${performanceNow}`
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please use PNG, JPEG, GIF, or WebP.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`
    }
    return null
  }

  const processFiles = useCallback(async (fileList: FileList) => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setError(null)
    setIsProcessing(true)

    try {
      const files = Array.from(fileList)
      const availableSlots = maxImages - images.length
      const filesToProcess = files.slice(0, availableSlots)

      if (files.length > availableSlots) {
        setError(`Only ${availableSlots} more image(s) can be added`)
      }

      const newImages: UploadedImage[] = []

      for (const file of filesToProcess) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }

        const isDuplicate = images.some(existingImage => 
          existingImage.name === file.name && existingImage.size === file.size
        )
        if (isDuplicate) {
          setError(`File "${file.name}" is already uploaded`)
          continue
        }

        try {
          const base64 = await fileToBase64(file)
          const previewUrl = URL.createObjectURL(file)

          const uploadedImage: UploadedImage = {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            base64,
            previewUrl,
            uploadedAt: new Date()
          }

          newImages.push(uploadedImage)
        } catch (error) {
          console.error('Error processing file:', file.name, error)
          setError(`Failed to process ${file.name}`)
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        console.log(`✅ [ImageUpload] Added ${newImages.length} images. Total: ${updatedImages.length}`)
        onImagesChange(updatedImages)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [images, maxImages, onImagesChange])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl)
    }
    
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
    
    // Adjust current index if needed
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1)
    }
    setError(null)
  }

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl))
    onImagesChange([])
    setCurrentImageIndex(0)
    setError(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const navigatePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const navigateNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  return (
    <Card className={`border-orange-100 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-orange-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🖼️ Reference Images</span>
            <span className="text-sm font-normal text-gray-500">
              ({images.length}/{maxImages})
            </span>
          </div>
          {images.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Display Area with Carousel */}
        {images.length === 0 ? (
          // Upload Zone when no images
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-orange-200 hover:border-orange-300'
            } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <Upload className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {isDragging ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPEG, GIF, WebP (max {maxImages} images, 10MB each)
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={openFileDialog}
                disabled={images.length >= maxImages || isProcessing}
                className="border-orange-200 hover:bg-orange-50"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        ) : (
          // Carousel Display when images exist
          <div className="space-y-3">
            {/* Main Image Display */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex].previewUrl}
                alt={images[currentImageIndex].name}
                className="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setPreviewImage(images[currentImageIndex].previewUrl)}
              />
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                    onClick={navigatePrevious}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                    onClick={navigateNext}
                    disabled={currentImageIndex === images.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Delete Button */}
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                onClick={() => removeImage(images[currentImageIndex].id)}
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative flex-shrink-0 cursor-pointer transition-all ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-orange-500' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <div className="w-20 h-20 rounded overflow-hidden bg-gray-100">
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-bl">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              {images.length < maxImages && (
                <button
                  className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-orange-200 rounded flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-all"
                  onClick={openFileDialog}
                >
                  <Upload className="h-6 w-6 text-orange-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Processing images...</AlertDescription>
          </Alert>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewImage(null)
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}