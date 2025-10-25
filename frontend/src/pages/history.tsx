import { useState, useEffect } from 'react';
import { Clock, Trash2, ExternalLink, TrendingUp, Target } from 'lucide-react';

interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  summary: string;
  sentiment: string;
  toxicity: number;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('threadsense_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('threadsense_history');
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem('threadsense_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
                <p className="text-sm text-gray-600">View your past analyses</p>
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
        {history.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{history.length} analysis{history.length !== 1 ? 'es' : ''} saved</p>
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{formatDate(item.timestamp)}</span>
                      </div>
                      
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4500] hover:underline font-medium text-lg mb-3 block flex items-center gap-2"
                      >
                        {item.url.split('/')[4] || 'Reddit Thread'}
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.summary}</p>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColor(item.sentiment)}`}>
                          {item.sentiment}
                        </span>
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Toxicity:</span> {Math.round(item.toxicity * 100)}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 border border-gray-300 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600 mb-6">
                Analyses you perform will appear here for quick access later.
              </p>
              <a 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold"
              >
                Start Analyzing
                <TrendingUp className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
