'use client'

import { useState, useEffect } from 'react'
import { nanoBananaClient } from '@/lib/api/nanoBananaClient'

export default function TestAPI() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get initial debug info
    try {
      const info = nanoBananaClient.getDebugInfo()
      setDebugInfo(info)
      
      const validation = nanoBananaClient.validateApiKey()
      setStatus(validation.message)
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const result = await nanoBananaClient.testConnection()
      setTestResult(result)
      setStatus(result.message)
    } catch (error) {
      setTestResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  const testImageGeneration = async () => {
    setIsLoading(true)
    try {
      const result = await nanoBananaClient.generateImage({
        prompt: 'A simple red circle on white background',
        model: 'gemini-2.5-flash-image-preview'
      })
      setTestResult({ success: true, message: 'Image generated successfully!', image: result })
      setStatus('Image generated successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult({ success: false, message: errorMessage })
      setStatus(`Generation failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Status:</h2>
          <p className={status.includes('valid') ? 'text-green-600' : 'text-red-600'}>
            {status}
          </p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Actions:</h2>
          <div className="space-x-2">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={testImageGeneration}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Generating...' : 'Test Image Generation'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="font-bold">Test Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
            {testResult.image?.imageUrl && (
              <div className="mt-4">
                <img 
                  src={testResult.image.imageUrl} 
                  alt="Generated test image"
                  className="max-w-md rounded border"
                />
              </div>
            )}
          </div>
        )}

        {debugInfo && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold">Debug Info:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}