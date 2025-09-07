'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TestTube, Zap, AlertCircle } from 'lucide-react'

// Import migrated utilities
import { generateWhiteBlankImage } from '@/lib/utils/aspectRatioUtils'

interface TestResult {
  test: string
  status: 'pass' | 'fail' | 'running'
  message: string
  details?: string
}

export function MigratedComponentTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1')
  const [testPrompt, setTestPrompt] = useState('A beautiful sunset over mountains')

  const aspectRatios = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    '3:4': { width: 1200, height: 1600 }
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const results: TestResult[] = []

    // Test 1: White Blank Image Generation
    try {
      const dimensions = aspectRatios[selectedAspectRatio as keyof typeof aspectRatios]
      const whiteImageBase64 = generateWhiteBlankImage(dimensions.width, dimensions.height)
      
      if (whiteImageBase64 && whiteImageBase64.length > 0) {
        results.push({
          test: 'White Blank Image Generation',
          status: 'pass',
          message: `Generated ${dimensions.width}x${dimensions.height} white image`,
          details: `Base64 length: ${whiteImageBase64.length} characters`
        })
      } else {
        results.push({
          test: 'White Blank Image Generation',
          status: 'fail',
          message: 'Failed to generate white blank image'
        })
      }
    } catch (error) {
      results.push({
        test: 'White Blank Image Generation',
        status: 'fail',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // Test 2: Aspect Ratio Utility Import
    try {
      const { getAspectRatioPromptSuffix } = await import('@/lib/utils/aspectRatioUtils')
      const promptSuffix = getAspectRatioPromptSuffix()
      
      if (promptSuffix.includes('white blank image')) {
        results.push({
          test: 'Aspect Ratio Utility Import',
          status: 'pass',
          message: 'Successfully imported and executed aspect ratio utilities',
          details: `Prompt suffix: "${promptSuffix}"`
        })
      } else {
        results.push({
          test: 'Aspect Ratio Utility Import',
          status: 'fail',
          message: 'Prompt suffix does not contain expected content'
        })
      }
    } catch (error) {
      results.push({
        test: 'Aspect Ratio Utility Import',
        status: 'fail',
        message: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // Test 3: API Client Import
    try {
      const { nanoBananaClient } = await import('@/lib/api/nanoBananaClient')
      
      if (nanoBananaClient && typeof nanoBananaClient.generateImage === 'function') {
        results.push({
          test: 'Gemini API Client Import',
          status: 'pass',
          message: 'Successfully imported nanoBananaClient',
          details: 'generateImage method available'
        })
      } else {
        results.push({
          test: 'Gemini API Client Import',
          status: 'fail',
          message: 'nanoBananaClient missing or incomplete'
        })
      }
    } catch (error) {
      results.push({
        test: 'Gemini API Client Import',
        status: 'fail',
        message: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    // Test 4: Environment Variables
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      
      if (apiKey && apiKey.startsWith('AIza')) {
        results.push({
          test: 'Environment Variables',
          status: 'pass',
          message: 'API key properly configured',
          details: `Key format: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
        })
      } else {
        results.push({
          test: 'Environment Variables',
          status: 'fail',
          message: 'API key missing or invalid format'
        })
      }
    } catch (error) {
      results.push({
        test: 'Environment Variables',
        status: 'fail',
        message: `Error checking environment: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <TestTube className="h-5 w-5" />
          Migrated Component Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
            <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Test Prompt</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter test prompt..."
              rows={2}
            />
          </div>
        </div>

        {/* Run Tests Button */}
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run Migration Tests
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Test Results:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'pass'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'fail'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.test}</span>
                  <Badge
                    variant={result.status === 'pass' ? 'default' : 'destructive'}
                    className={
                      result.status === 'pass'
                        ? 'bg-green-500'
                        : result.status === 'fail'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }
                  >
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {testResults.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {testResults.filter(r => r.status === 'pass').length} / {testResults.length} tests passed
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}