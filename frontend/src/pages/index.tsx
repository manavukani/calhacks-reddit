import { useState } from "react";
import { Sparkles, Target } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState<string>("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function go() {
    if (!url.trim()) {
      setError("Please enter a Reddit thread URL");
      return;
    }
    if (!url.includes('reddit.com')) {
      setError("Please enter a valid Reddit URL");
      return;
    }
    
    setLoading(true);
    setSummary(""); 
    setAnalysis(null);
    setError("");
    
    try {
      const [sumRes, anaRes] = await Promise.all([
        fetch("http://localhost:8000/api/summarize", {
          method: "POST", 
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ thread_url: url })
        }),
        fetch("http://localhost:8000/api/analyze", {
          method: "POST", 
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ thread_url: url })
        })
      ]);
      
      if (!sumRes.ok || !anaRes.ok) {
        throw new Error('Failed to analyze thread');
      }
      
      const sum = await sumRes.json();
      const ana = await anaRes.json();
      
      setSummary(sum.summary || "No summary available");
      setAnalysis(ana.analysis || {});
    } catch (err) {
      setError("Failed to analyze thread. Please check the URL and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const tryExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl">ThreadSense</span>
            </div>
            <div className="flex gap-2">
              <a href="/dashboard" className="px-4 py-2 text-sm bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold">
                Dashboard
              </a>
              <a href="/compare" className="px-4 py-2 text-sm text-[#FF4500] border border-[#FF4500] rounded-full hover:bg-orange-50 transition font-semibold">
                Compare
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">ThreadSense</h1>
          <p className="text-lg text-gray-600 mb-4">AI-powered Reddit thread analysis in seconds</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Backend Online</span>
            </div>
            <span>•</span>
            <span>Claude AI Active</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="bg-[#FF4500] text-white px-6 py-4 rounded-lg mb-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <strong>Live Mode:</strong> Powered by Claude AI
          </div>
          <small className="opacity-90">Real-time Reddit analysis with advanced sentiment detection</small>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-300">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reddit Thread URL</label>
          <div className="flex gap-3 mb-3">
            <input
              value={url} 
              onChange={e => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="https://www.reddit.com/r/AskReddit/comments/..."
              className={`flex-1 px-4 py-3 border-2 rounded-full focus:outline-none transition ${
                error 
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-[#FF4500] focus:ring-2 focus:ring-orange-200'
              }`}
              onKeyPress={e => e.key === 'Enter' && !loading && go()}
            />
            <button 
              onClick={go} 
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-[#FF4500] text-white font-bold rounded-full hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing
                </span>
              ) : "Analyze"}
            </button>
          </div>
          
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-600 font-medium">Try an example:</span>
            <button 
              onClick={() => tryExample('https://www.reddit.com/r/AskReddit/comments/js8e1z/')}
              className="text-xs text-[#FF4500] hover:underline font-medium"
            >
              Popular AskReddit
            </button>
            <span className="text-gray-400">•</span>
            <button 
              onClick={() => tryExample('https://www.reddit.com/r/technology/comments/1ofd9k8/')}
              className="text-xs text-[#FF4500] hover:underline font-medium"
            >
              Tech Discussion
            </button>
            <span className="text-gray-400">•</span>
            <button 
              onClick={() => tryExample('https://www.reddit.com/r/dataisbeautiful/comments/1oexlhq/')}
              className="text-xs text-[#FF4500] hover:underline font-medium"
            >
              Data Viz
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 border border-gray-300">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-[#FF4500] rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">Analyzing Thread...</p>
                <p className="text-sm text-gray-600">Fetching comments and running AI analysis</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary */}
        {!loading && summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#FF4500] rounded-full"></div>
              Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Insights */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#FF4500] rounded-full"></div>
              Quick Insights
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <p className="text-sm text-[#FF4500] font-bold">Sentiment</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{analysis.sentiment_overall || 'N/A'}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <p className="text-sm text-red-700 font-bold">Toxicity</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round((analysis.toxicity_ratio || 0) * 100)}%</p>
              </div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-[#FF4500] font-medium">View raw data</summary>
              <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto border border-gray-300">{JSON.stringify(analysis, null, 2)}</pre>
            </details>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border-2 border-[#FF4500]">
              <p className="text-sm text-gray-700">
                💡 <strong className="text-[#FF4500]">Pro Tip:</strong> Try the <a href="/dashboard" className="text-[#FF4500] underline font-bold hover:text-[#ff5722]">Dashboard</a> for visualizations and deeper insights!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
