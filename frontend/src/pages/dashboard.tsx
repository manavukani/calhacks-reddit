import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { MessageSquare, TrendingUp, AlertTriangle, Users, Target, Flame, Clock, ArrowLeft } from 'lucide-react';
import SentimentGauge from '../components/SentimentGauge';
import KeywordCloud from '../components/KeywordCloud';
import EmotionChart from '../components/EmotionChart';
import MetricCard from '../components/MetricCard';
import ExportButton from '../components/ExportButton';
import ModerationCard from '../components/ModerationCard';

export default function Dashboard() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState<string>("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string>("");

  const [backUrl, setBackUrl] = useState<string>("");
  
  // Moderation state
  const [moderationLoading, setModerationLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [moderationError, setModerationError] = useState<string>("");

  // Auto-fill URL from query parameter and store back URL
  useEffect(() => {
    if (router.isReady && router.query.url) {
      const urlParam = router.query.url as string;
      setUrl(urlParam);
    }
    if (router.isReady && router.query.from) {
      const fromParam = router.query.from as string;
      setBackUrl(fromParam);
    }
  }, [router.isReady, router.query.url, router.query.from]);

  // Auto-fill URL from query parameter and store back URL
  useEffect(() => {
    if (router.isReady && router.query.url) {
      const urlParam = router.query.url as string;
      setUrl(urlParam);
    }
    if (router.isReady && router.query.from) {
      const fromParam = router.query.from as string;
      setBackUrl(fromParam);
    }
  }, [router.isReady, router.query.url, router.query.from]);

  const tryExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError("");
  };
  
  const saveToHistory = (data: any) => {
    const historyItem = {
      id: Date.now().toString(),
      url: data.url,
      timestamp: Date.now(),
      summary: data.summary,
      sentiment: data.sentiment,
      toxicity: data.toxicity
    };
    
    const stored = localStorage.getItem('threadsense_history');
    let history = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    }
    
    history.unshift(historyItem);
    // Keep only last 50
    history = history.slice(0, 50);
    localStorage.setItem('threadsense_history', JSON.stringify(history));
  };

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

      const sum = await sumRes.json();
      const ana = await anaRes.json();
      
      setSummary(sum.summary || "No summary");
      setAnalysis(ana.analysis || {});
      setCount(ana.count || 0);
      
      // Save to history
      saveToHistory({
        url: url,
        summary: sum.summary || "",
        sentiment: ana.analysis?.sentiment_overall || "neutral",
        toxicity: ana.analysis?.toxicity_ratio || 0
      });
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze thread. Please check the URL and try again.");
    }
    
    setLoading(false);
  }

  async function moderateThread(threadUrl: string) {
    if (!threadUrl.trim()) {
      setModerationError("Please enter a Reddit thread URL");
      throw new Error("Please enter a Reddit thread URL");
    }
    if (!threadUrl.includes('reddit.com')) {
      setModerationError("Please enter a valid Reddit URL");
      throw new Error("Please enter a valid Reddit URL");
    }
    
    setModerationLoading(true);
    setModerationResult(null);
    setModerationError("");
    
    try {
      const response = await fetch("http://localhost:8000/api/moderate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ thread_url: threadUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to moderate thread');
      }
      
      const result = await response.json();
      setModerationResult(result);
      return result;
    } catch (err) {
      console.error("Moderation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to moderate thread. Please check the URL and try again.";
      setModerationError(errorMessage);
      throw err;
    } finally {
      setModerationLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/landing" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reddit:AI</h1>
                <p className="text-sm text-gray-600">AI-Powered Reddit Analysis</p>
              </div>
            </a>
            <div className="flex gap-2">
              {backUrl && (
                <a href={backUrl} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition font-semibold flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Thread
                </a>
              )}
              <a href={backUrl ? `/history?from=${encodeURIComponent(backUrl)}` : '/history'} className="px-4 py-2 text-sm text-[#FF4500] border border-[#FF4500] rounded-full hover:bg-orange-50 transition font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                History
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-300">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Analyze a Reddit Thread</label>
          <div className="flex gap-3 mb-3">
            <input
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="Paste a Reddit thread URL (e.g., https://www.reddit.com/r/AskReddit/comments/...)"
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
              className="px-8 py-3 bg-[#FF4500] text-white font-bold rounded-full hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
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
            <span className="text-xs text-gray-600 font-medium">Examples:</span>
            <button 
              onClick={() => tryExample('https://www.reddit.com/r/AskReddit/comments/js8e1z/')}
              className="text-xs text-[#FF4500] hover:underline font-medium"
            >
              AskReddit
            </button>
            <span className="text-gray-400">•</span>
            <button 
              onClick={() => tryExample('https://www.reddit.com/r/technology/comments/1ofd9k8/')}
              className="text-xs text-[#FF4500] hover:underline font-medium"
            >
              Technology
            </button>
          </div>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Comments"
                value={count}
                icon={MessageSquare}
                color="blue"
              />
              <MetricCard
                title="Toxicity Level"
                value={`${Math.round((analysis.toxicity_ratio || 0) * 100)}%`}
                icon={AlertTriangle}
                color={analysis.toxicity_ratio > 0.5 ? 'red' : analysis.toxicity_ratio > 0.3 ? 'yellow' : 'green'}
                subtitle={analysis.toxicity_ratio > 0.5 ? 'High' : analysis.toxicity_ratio > 0.3 ? 'Moderate' : 'Low'}
              />
              <MetricCard
                title="Controversy"
                value={`${Math.round((analysis.controversy_score || 0) * 100)}%`}
                icon={Flame}
                color={analysis.controversy_score > 0.6 ? 'red' : analysis.controversy_score > 0.4 ? 'yellow' : 'blue'}
                subtitle={analysis.controversy_score > 0.6 ? 'Heated' : 'Balanced'}
              />
              <MetricCard
                title="Overall Sentiment"
                value={analysis.sentiment_overall || 'N/A'}
                icon={TrendingUp}
                color={analysis.sentiment_overall === 'positive' ? 'green' : analysis.sentiment_overall === 'negative' ? 'red' : 'blue'}
              />
            </div>

            {/* Export Button */}
            <div className="flex justify-end mb-6">
              <ExportButton 
                data={{ summary, analysis, count }} 
                threadUrl={url}
              />
            </div>

            {/* AI Moderation Card */}
            <ModerationCard
              threadUrl={url}
              onModerate={moderateThread}
              loading={moderationLoading}
              result={moderationResult}
              error={moderationError}
            />
            
            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FF4500] rounded-full"></div>
                <MessageSquare className="w-5 h-5 text-[#FF4500]" />
                AI Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>

            {/* Sentiment & Emotions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Gauge */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sentiment Score</h3>
                <div className="flex justify-center">
                  <SentimentGauge 
                    score={analysis.sentiment_score || 0} 
                    label="Community Mood"
                  />
                </div>
              </div>

              {/* Emotion Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emotion Analysis</h3>
                {analysis.emotion_breakdown && (
                  <EmotionChart emotions={analysis.emotion_breakdown} />
                )}
              </div>
            </div>

            {/* Keywords */}
            {analysis.top_keywords && analysis.top_keywords.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Keywords</h3>
                <KeywordCloud keywords={analysis.top_keywords} />
              </div>
            )}

            {/* Themes & Opinions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Themes */}
              {analysis.themes && analysis.themes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Main Themes</h3>
                  <div className="space-y-2">
                    {analysis.themes.map((theme: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <div className="w-6 h-6 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700">{theme}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Opinions */}
              {analysis.key_opinions && analysis.key_opinions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Key Opinions</h3>
                  <div className="space-y-3">
                    {analysis.key_opinions.map((opinion: string, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-gray-700 italic">"{opinion}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 border border-gray-300 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Analyze</h3>
              <p className="text-gray-600">
                Paste a Reddit thread URL above to get AI-powered insights including sentiment analysis, 
                trending keywords, emotion breakdown, and more.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
