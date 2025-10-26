import { Code, Key, Zap, Shield, Target, Book } from 'lucide-react';

export default function APIPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/health',
      description: 'Check API health status',
      auth: false,
      example: `curl http://localhost:8000/health`,
      response: `{
  "ok": true,
  "time": 1761384291.36,
  "has_anthropic_key": true,
  "api_provider": "anthropic"
}`
    },
    {
      method: 'POST',
      path: '/api/summarize',
      description: 'Generate 3-sentence summary of a Reddit thread',
      auth: false,
      example: `curl -X POST http://localhost:8000/api/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"thread_url": "https://www.reddit.com/r/.../"}'`,
      response: `{
  "summary": "AI-generated summary text...",
  "count": 57
}`
    },
    {
      method: 'POST',
      path: '/api/analyze',
      description: 'Full sentiment analysis with emotions, keywords, and themes',
      auth: false,
      example: `curl -X POST http://localhost:8000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"thread_url": "https://www.reddit.com/r/.../"}'`,
      response: `{
  "analysis": {
    "sentiment_overall": "mixed",
    "sentiment_score": 0.2,
    "top_keywords": ["technology", "discussion", ...],
    "toxicity_ratio": 0.15,
    "controversy_score": 0.6,
    "themes": ["Main theme 1", "Theme 2", ...],
    "key_opinions": ["Opinion 1", "Opinion 2"],
    "emotion_breakdown": {"happy": 25, "angry": 10, ...}
  },
  "count": 57
}`
    },
    {
      method: 'POST',
      path: '/api/compare',
      description: 'Compare 2-5 threads side-by-side',
      auth: false,
      example: `curl -X POST http://localhost:8000/api/compare \\
  -H "Content-Type: application/json" \\
  -d '{
    "thread_urls": [
      "https://www.reddit.com/r/tech/...",
      "https://www.reddit.com/r/gadgets/..."
    ]
  }'`,
      response: `{
  "threads": [
    {
      "url": "...",
      "summary": "...",
      "analysis": {...},
      "count": 57
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/batch',
      description: 'Batch analyze up to 20 threads (Enterprise)',
      auth: true,
      example: `curl -X POST http://localhost:8000/api/batch \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "thread_urls": [...]
  }'`,
      response: `{
  "total": 10,
  "successful": 9,
  "failed": 1,
  "results": [...]
}`
    },
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get API usage statistics',
      auth: true,
      example: `curl http://localhost:8000/api/stats \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "total_analyses": 1247,
  "active_users": 89,
  "avg_response_time": "4.2s",
  "uptime": "99.9%"
}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Reddit:AI API</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/landing" className="text-gray-700 hover:text-[#FF4500] transition">Home</a>
              <a href="/dashboard" className="px-4 py-2 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold">
                Launch App
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF4500] to-[#ff5722] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Code className="w-4 h-4" />
            <span className="text-sm font-semibold">REST API Documentation</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Powerful Reddit Intelligence API</h1>
          <p className="text-xl opacity-90 mb-8">
            Integrate Reddit:AI into your workflow with our simple REST API
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#endpoints" className="px-6 py-3 bg-white text-[#FF4500] rounded-full hover:bg-gray-100 transition font-bold">
              View Endpoints
            </a>
            <a href="#pricing" className="px-6 py-3 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-semibold">
              See Pricing
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">Average response time under 5 seconds with 99.9% uptime</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">Enterprise-grade security with API key authentication</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple REST API with JSON responses and clear documentation</p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Base URL:</strong> <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">http://localhost:8000</code>
              </p>
              <p>
                <strong>Authentication:</strong> Some endpoints require an API key. Pass it in the Authorization header:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </pre>
              <p>
                <strong>Rate Limits:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Free Tier: 10 requests/day</li>
                <li>Pro Tier: Unlimited</li>
                <li>Enterprise: Custom limits</li>
              </ul>
            </div>
          </div>

          {/* Endpoints */}
          <div id="endpoints" className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
            
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                    </div>
                    {endpoint.auth && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                        <Key className="w-3 h-3" />
                        Auth Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-gray-700">{endpoint.description}</p>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Request</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {endpoint.example}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h4>
                    <pre className="bg-gray-50 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                      {endpoint.response}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div id="pricing" className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">API Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-600">/mo</span></div>
                <ul className="space-y-3 text-gray-700">
                  <li>✓ 10 API calls/day</li>
                  <li>✓ Basic endpoints</li>
                  <li>✓ Community support</li>
                </ul>
              </div>
              
              <div className="bg-[#FF4500] rounded-2xl p-8 transform scale-105 shadow-xl">
                <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                  POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg opacity-90">/mo</span></div>
                <ul className="space-y-3 text-white">
                  <li>✓ Unlimited API calls</li>
                  <li>✓ All endpoints</li>
                  <li>✓ Priority support</li>
                  <li>✓ 99.9% SLA</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">Custom</div>
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Custom rate limits</li>
                  <li>✓ Dedicated support</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ SLA guarantees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2025 Reddit:AI API. Built for developers.</p>
        </div>
      </footer>
    </div>
  );
}
