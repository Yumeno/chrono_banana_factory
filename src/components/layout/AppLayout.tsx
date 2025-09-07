'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface AppLayoutProps {
  children?: ReactNode
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function AppLayout({ leftPanel, rightPanel }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-orange-600">
            🍌 Chrono Banana Factory
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Time-based Story Visualization
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel - World Building */}
          <Card className="border-orange-200 bg-white">
            <div className="p-6 h-full">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-orange-700 mb-2">
                  🌟 World Building
                </h2>
                <p className="text-sm text-gray-600">
                  Story input and reference images
                </p>
              </div>
              <div className="h-full">
                {leftPanel}
              </div>
            </div>
          </Card>

          {/* Right Panel - Generated Results */}
          <Card className="border-orange-200 bg-white">
            <div className="p-6 h-full">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-orange-700 mb-2">
                  ⏰ Time-Series Results
                </h2>
                <p className="text-sm text-gray-600">
                  Generated scene visualization
                </p>
              </div>
              <div className="h-full">
                {rightPanel}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}