import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Users, Clock, Zap, X } from 'lucide-react';

interface AgentDecision {
  subreddit: string;
  agent_id: string;
  decision: string;
  confidence: number;
  reason: string;
  raw_response: string;
}

interface CommentClassification {
  text: string;
  label: 'VIOLATION' | 'NEEDS_WARNING' | 'FINE' | 'ERROR';
  reason?: string;
}

interface FinalDecision {
  final_decision: string;
  confidence: number;
  verdict_breakdown: {
    VIOLATION: number;
    NEEDS_WARNING: number;
    FINE: number;
    ERROR: number;
  };
  total_agents: number;
  valid_responses: number;
}

interface ModerationResult {
  thread_url: string;
  detected_subreddit: string;
  agent_used: string;
  comment_count: number;
  agent_decisions: AgentDecision[];
  final_decision: FinalDecision;
  shared_memory_id: string;
  comment_classifications?: CommentClassification[];
}

interface ModerationCardProps {
  threadUrl: string;
  onModerate: (url: string) => Promise<ModerationResult>;
  loading: boolean;
  result: ModerationResult | null;
  error: string;
}

export default function ModerationCard({ threadUrl, onModerate, loading, result, error }: ModerationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'VIOLATION':
      case 'PLATFORM_VIOLATION':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'NEEDS_WARNING':
      case 'GLOBAL_WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FINE':
      case 'CLEAN':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'ERROR':
      case 'INCONCLUSIVE':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'VIOLATION':
      case 'PLATFORM_VIOLATION':
        return <XCircle className="w-5 h-5" />;
      case 'NEEDS_WARNING':
      case 'GLOBAL_WARNING':
        return <AlertTriangle className="w-5 h-5" />;
      case 'FINE':
      case 'CLEAN':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#FF4500] rounded-full"></div>
            <Shield className="w-5 h-5 text-[#FF4500]" />
            AI Moderation Analysis
          </h3>
          {result && (
            <p className="text-sm text-gray-600 mt-1">
              Detected: r/{result.detected_subreddit} → Using: {result.agent_used} agent
            </p>
          )}
        </div>
        <button
          onClick={() => onModerate(threadUrl)}
          disabled={loading || !threadUrl.trim()}
          className="px-4 py-2 bg-[#FF4500] text-white font-semibold rounded-full hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Moderate
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Final Decision */}
          <div className={`p-4 rounded-lg border-2 ${getDecisionColor(result.final_decision.final_decision)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getDecisionIcon(result.final_decision.final_decision)}
              <h4 className="font-bold text-lg">Final Decision</h4>
              <span className={`text-sm font-semibold ${getConfidenceColor(result.final_decision.confidence)}`}>
                {Math.round(result.final_decision.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm font-medium capitalize">
              {result.final_decision.final_decision.replace('_', ' ').toLowerCase()}
            </p>
          </div>

          {/* Agent Decision */}
          <div className="grid grid-cols-1 gap-3">
            {result.agent_decisions.map((decision, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${getDecisionColor(decision.decision)}`}>
                <div className="flex items-center gap-3 mb-2">
                  {getDecisionIcon(decision.decision)}
                  <span className="text-sm font-bold">r/{decision.subreddit} Agent</span>
                  <span className={`text-sm font-semibold ${getConfidenceColor(decision.confidence)}`}>
                    {Math.round(decision.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm font-medium capitalize mb-2">
                  Decision: {decision.decision.replace('_', ' ').toLowerCase()}
                </p>
                <p className="text-xs text-gray-700">
                  {decision.reason}
                </p>
              </div>
            ))}
          </div>

          {/* Comment Flagging Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setShowAnalysisModal(true)}
              className="font-semibold text-gray-900 mb-2 flex items-center gap-2 hover:text-[#FF4500]"
            >
              <Users className="w-4 h-4" />
              Comment Analysis
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-red-600">Violations:</span>
                <span className="font-semibold">{result.final_decision.verdict_breakdown.VIOLATION}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-yellow-600">Warnings:</span>
                <span className="font-semibold">{result.final_decision.verdict_breakdown.NEEDS_WARNING}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-600">Clean:</span>
                <span className="font-semibold">{result.final_decision.verdict_breakdown.FINE}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600">Errors:</span>
                <span className="font-semibold">{result.final_decision.verdict_breakdown.ERROR}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600">Subreddit Detected:</span>
                  <span className="font-semibold">r/{result.detected_subreddit}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">Agent Used:</span>
                  <span className="font-semibold">r/{result.agent_used}</span>
                </div>
              </div>
            </div>
          </div>

          {showAnalysisModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowAnalysisModal(false)}></div>
              <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl border border-gray-200">
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
                    onClick={() => setShowAnalysisModal(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Comment Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div className="p-3 rounded border bg-red-50 border-red-200 flex items-center justify-between">
                      <span className="text-red-700">Violations</span>
                      <span className="font-semibold text-red-800">{result.final_decision.verdict_breakdown.VIOLATION}</span>
                    </div>
                    <div className="p-3 rounded border bg-yellow-50 border-yellow-200 flex items-center justify-between">
                      <span className="text-yellow-700">Warnings</span>
                      <span className="font-semibold text-yellow-800">{result.final_decision.verdict_breakdown.NEEDS_WARNING}</span>
                    </div>
                    <div className="p-3 rounded border bg-green-50 border-green-200 flex items-center justify-between">
                      <span className="text-green-700">Clean</span>
                      <span className="font-semibold text-green-800">{result.final_decision.verdict_breakdown.FINE}</span>
                    </div>
                    <div className="p-3 rounded border bg-gray-50 border-gray-200 flex items-center justify-between">
                      <span className="text-gray-700">Errors</span>
                      <span className="font-semibold text-gray-800">{result.final_decision.verdict_breakdown.ERROR}</span>
                    </div>
                  </div>
                  {(() => {
                    const cls = result?.comment_classifications ?? [];
                    const violations = cls.filter(c => c.label === 'VIOLATION');
                    const warnings = cls.filter(c => c.label === 'NEEDS_WARNING');
                    const clean = cls.filter(c => c.label === 'FINE');
                    const errors = cls.filter(c => c.label === 'ERROR');
                    return (
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-2">Violations ({violations.length})</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            {violations.length === 0 ? (
                              <li className="text-gray-500">No violating comments detected.</li>
                            ) : (
                              violations.map((c, i) => (
                                <li key={`v-${i}`} className="p-2 rounded border border-red-200 bg-red-50">
                                  <p className="text-red-900">{c.text}</p>
                                  {c.reason && (
                                    <p className="mt-1 text-xs text-red-700">{c.reason}</p>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-700 mb-2">Warnings ({warnings.length})</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            {warnings.length === 0 ? (
                              <li className="text-gray-500">No comments requiring warnings.</li>
                            ) : (
                              warnings.map((c, i) => (
                                <li key={`w-${i}`} className="p-2 rounded border border-yellow-200 bg-yellow-50">
                                  <p className="text-yellow-900">{c.text}</p>
                                  {c.reason && (
                                    <p className="mt-1 text-xs text-yellow-700">{c.reason}</p>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-2">Clean ({clean.length})</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            {clean.length === 0 ? (
                              <li className="text-gray-500">No clean comments identified.</li>
                            ) : (
                              clean.map((c, i) => (
                                <li key={`c-${i}`} className="p-2 rounded border border-green-200 bg-green-50">
                                  <p className="text-green-900">{c.text}</p>
                                  {c.reason && (
                                    <p className="mt-1 text-xs text-green-700">{c.reason}</p>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Errors ({errors.length})</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            {errors.length === 0 ? (
                              <li className="text-gray-500">No errors reported.</li>
                            ) : (
                              errors.map((c, i) => (
                                <li key={`e-${i}`} className="p-2 rounded border border-gray-200 bg-gray-50">
                                  <p className="text-gray-900">{c.text}</p>
                                  {c.reason && (
                                    <p className="mt-1 text-xs text-gray-600">{c.reason}</p>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Agent Responses */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-[#FF4500] hover:underline font-medium flex items-center gap-1"
            >
              <Clock className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Detailed Agent Responses
            </button>
            
            {showDetails && (
              <div className="mt-3 space-y-3">
                {result.agent_decisions.map((decision, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">r/{decision.subreddit}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDecisionColor(decision.decision)}`}>
                        {decision.decision}
                      </span>
                      <span className={`text-xs ${getConfidenceColor(decision.confidence)}`}>
                        {Math.round(decision.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{decision.reason}</p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        View raw response
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                        {decision.raw_response}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>Analyzed {result.comment_count} comments using r/{result.agent_used} AI agent</p>
            <p>Shared Memory ID: {result.shared_memory_id}</p>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            Click "Moderate" to analyze this thread with AI agents
          </p>
        </div>
      )}
    </div>
  );
}
