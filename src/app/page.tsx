'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EnvironmentStatus {
  apiKeyFound: boolean
  apiKeyPreview: string
  platform: string
  isClient: boolean
}

export default function Home() {
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus | null>(null)

  useEffect(() => {
    // クライアントサイドでの環境変数チェック
    const checkEnvironment = () => {
      // Next.js環境変数の取得
      const clientApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      
      setEnvStatus({
        apiKeyFound: !!clientApiKey,
        apiKeyPreview: clientApiKey ? `${clientApiKey.slice(0, 8)}...${clientApiKey.slice(-4)}` : 'Not found',
        platform: typeof window !== 'undefined' ? 'Browser' : 'Server',
        isClient: typeof window !== 'undefined'
      })
    }

    checkEnvironment()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-orange-600">
            🍌 Chrono Banana Factory
          </h1>
          <p className="text-xl text-gray-600">
            Time-based Story Visualization with Gemini AI
          </p>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Nano Banana Hackathon 2025
          </Badge>
        </div>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Environment Status
            </CardTitle>
            <CardDescription>
              API key and environment configuration check
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">GEMINI_API_KEY</span>
                  <div className="flex items-center gap-2">
                    {envStatus.apiKeyFound ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={envStatus.apiKeyFound ? 'default' : 'destructive'}>
                      {envStatus.apiKeyFound ? 'Found' : 'Not Found'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <div>Platform: {envStatus.platform}</div>
                  <div>Preview: <code>{envStatus.apiKeyPreview}</code></div>
                </div>

                {!envStatus.apiKeyFound && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      To use client-side features, set up your API key:
                    </p>
                    <div className="bg-yellow-100 p-3 rounded text-sm text-yellow-800">
                      <div className="font-medium mb-1">PowerShell:</div>
                      <code>$env:NEXT_PUBLIC_GEMINI_API_KEY="your_api_key"</code>
                      <div className="mt-2 font-medium mb-1">Or create .env.local:</div>
                      <code>NEXT_PUBLIC_GEMINI_API_KEY=your_api_key</code>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Checking environment...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle>🚀 Implementation Status</CardTitle>
            <CardDescription>
              Migrated components from bananastory Phase 1-2.7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Completed</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Aspect ratio control (Phase 2.7)</li>
                  <li>• Gemini API integration</li>
                  <li>• Zustand state management</li>
                  <li>• shadcn/ui components</li>
                  <li>• TypeScript configuration</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">🔄 Next Phase</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Time-point control UI</li>
                  <li>• Left-right panel layout</li>
                  <li>• Story text input</li>
                  <li>• Timeline visualization</li>
                  <li>• Multi-image carousel</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Built with Next.js 15.5.2, TypeScript, and TailwindCSS
        </div>
      </div>
    </div>
  )
}
