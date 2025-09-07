// 環境変数の確実な取得ユーティリティ
export function getEnvironmentVariable(name: string): string | undefined {
  // 複数の取得方法を試行
  const sources = [
    process.env[name],
    // Next.jsクライアントサイド対応
    name === 'GEMINI_API_KEY' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : undefined,
    typeof window !== 'undefined' ? undefined : process.env[name],
  ]

  // Node.js環境でのみ直接実行による取得
  if (typeof window === 'undefined') {
    try {
      // Windows環境での直接取得
      if (process.platform === 'win32') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { execSync } = require('child_process')
        
        // PowerShell経由での取得
        try {
          const result = execSync(`powershell -Command "$env:${name}"`, { 
            encoding: 'utf8', 
            timeout: 2000,
            stdio: ['pipe', 'pipe', 'ignore'] // stderrを無視
          }).trim()
          if (result && result !== '' && !result.toLowerCase().includes('not found')) {
            sources.push(result)
          }
        } catch {
          // PowerShell失敗は無視
        }

        // CMD経由での取得
        try {
          const result = execSync(`echo %${name}%`, { 
            encoding: 'utf8', 
            timeout: 2000,
            stdio: ['pipe', 'pipe', 'ignore'] // stderrを無視
          }).trim()
          if (result && result !== `%${name}%` && !result.toLowerCase().includes('not found')) {
            sources.push(result)
          }
        } catch {
          // CMD失敗は無視
        }
      }
    } catch {
      // 全体的な失敗は無視
    }
  }

  // 最初に見つかった有効な値を返す
  for (const value of sources) {
    if (value && typeof value === 'string' && value.trim() && value.trim() !== '') {
      return value.trim()
    }
  }

  return undefined
}

// デバッグ用の環境変数情報取得
export function getEnvironmentDebugInfo(): Record<string, unknown> {
  const targetVars = ['GEMINI_API_KEY', 'NEXT_PUBLIC_GEMINI_API_KEY', 'NODE_ENV']
  
  const info: Record<string, unknown> = {
    platform: process.platform,
    isServer: typeof window === 'undefined',
    nodeEnv: process.env.NODE_ENV,
    variables: {}
  }

  targetVars.forEach(varName => {
    const value = getEnvironmentVariable(varName)
    ;(info.variables as Record<string, unknown>)[varName] = {
      found: !!value,
      preview: value ? `${value.slice(0, 8)}...${value.slice(-4)}` : 'Not found'
    }
  })

  return info
}