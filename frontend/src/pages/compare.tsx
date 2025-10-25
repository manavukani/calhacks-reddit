import { useState } from "react";
import { GitCompare, Target, Plus, X, TrendingUp, AlertTriangle } from 'lucide-react';
import SentimentGauge from '../components/SentimentGauge';

export default function Compare() {
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, ""]);
    }
  };

  const removeUrl = (index: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const tryExamples = () => {
    setUrls([
      'https://www.reddit.com/r/AskReddit/comments/1ofcgqw/',
      'https://www.reddit.com/r/technology/comments/1ofd9k8/'
    ]);
    setError("");
  };

  async function compare() {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length < 2) {
      setError("Please enter at least 2 thread URLs to compare");
      return;
    }
    
    const invalidUrls = validUrls.filter(u => !u.includes('reddit.com'));
    if (invalidUrls.length > 0) {
      setError("All URLs must be valid Reddit thread URLs");
      return;
    }

    setLoading(true);
    setResults([]);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/compare", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ thread_urls: validUrls })
      });
      
      if (!res.ok) {
        throw new Error('Failed to compare threads');
      }

      const data = await res.json();
      setResults(data.threads || []);
    } catch (err) {
      console.error("Comparison failed:", err);
      setError("Failed to compare threads. Please check your URLs and try again.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF4500] rounded-full flex items-center justify-center">
                <GitCompare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compare Threads</h1>
                <p className="text-sm text-gray-600">Side-by-side Reddit analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/" className="px-4 py-2 text-sm text-[#FF4500] border border-[#FF4500] rounded-full hover:bg-orange-50 transition font-semibold">
                Simple View
              </a>
              <a href="/dashboard" className="px-4 py-2 text-sm bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* URL Inputs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#FF4500] rounded-full"></div>
              Enter Thread URLs
            </h3>
            <button
              onClick={tryExamples}
              className="text-xs text-[#FF4500] hover:underline font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
              </svg>
              Load Examples
            </button>
          </div>
          <div className="space-y-3">
            {urls.map((url, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-10 flex items-center justify-center bg-orange-100 text-[#FF4500] font-bold rounded-lg flex-shrink-0">
                  {idx + 1}
                </div>
                <input
                  value={url}
                  onChange={e => updateUrl(idx, e.target.value)}
                  placeholder={`Thread ${idx + 1} URL`}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-orange-200"
                />
                {urls.length > 2 && (
                  <button
                    onClick={() => removeUrl(idx)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            {urls.length < 5 && (
              <button
                onClick={addUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#FF4500] border border-[#FF4500] rounded-full hover:bg-orange-50 transition font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Thread
              </button>
            )}
            <button
              onClick={compare}
              disabled={loading || urls.filter(u => u.trim()).length < 2}
              className="flex-1 px-8 py-3 bg-[#FF4500] text-white font-bold rounded-full hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Comparing...
                </span>
              ) : "Compare Threads"}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((result, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#FF4500] p-4">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.url.split('/')[4] || 'Thread'}</p>
                        <p className="text-xs opacity-90">{result.count} comments</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Sentiment */}
                    <div className="flex justify-center">
                      <SentimentGauge 
                        score={result.analysis?.sentiment_score || 0}
                        label="Sentiment"
                      />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-red-700 font-medium">Toxicity</p>
                        </div>
                        <p className="text-xl font-bold text-red-900">
                          {Math.round((result.analysis?.toxicity_ratio || 0) * 100)}%
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700 font-medium">Controversy</p>
                        </div>
                        <p className="text-xl font-bold text-blue-900">
                          {Math.round((result.analysis?.controversy_score || 0) * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                        {result.summary}
                      </p>
                    </div>

                    {/* Keywords */}
                    {result.analysis?.top_keywords && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Top Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {result.analysis.top_keywords.slice(0, 5).map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-orange-100 text-[#FF4500] text-xs rounded-full font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FF4500] rounded-full"></div>
                Comparison Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1">Most Positive</p>
                  <p className="text-lg font-bold text-green-900">
                    Thread {results.findIndex(r => r.analysis?.sentiment_score === Math.max(...results.map(r => r.analysis?.sentiment_score || -1))) + 1}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-1">Most Toxic</p>
                  <p className="text-lg font-bold text-red-900">
                    Thread {results.findIndex(r => r.analysis?.toxicity_ratio === Math.max(...results.map(r => r.analysis?.toxicity_ratio || 0))) + 1}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium mb-1">Most Controversial</p>
                  <p className="text-lg font-bold text-orange-900">
                    Thread {results.findIndex(r => r.analysis?.controversy_score === Math.max(...results.map(r => r.analysis?.controversy_score || 0))) + 1}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 border border-gray-300 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitCompare className="w-10 h-10 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compare Reddit Threads</h3>
              <p className="text-gray-600">
                Add 2-5 Reddit thread URLs above to compare their sentiment, toxicity, 
                keywords, and overall discussion tone side-by-side.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
