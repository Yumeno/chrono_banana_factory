'use client'

export default function TestEnv() {
  // 環境変数を直接確認
  const directEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  const allEnvKeys = Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('NEXT'))
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Direct Access Test:</h2>
          <p>process.env.NEXT_PUBLIC_GEMINI_API_KEY = {directEnv ? `"${directEnv}"` : 'undefined'}</p>
          <p>Type: {typeof directEnv}</p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">All Relevant Env Keys:</h2>
          <pre>{JSON.stringify(allEnvKeys, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Process Env Check:</h2>
          <pre>{JSON.stringify(process.env, null, 2).slice(0, 500)}...</pre>
        </div>
      </div>
    </div>
  )
}