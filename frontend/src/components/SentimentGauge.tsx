import React from 'react';

interface SentimentGaugeProps {
  score: number; // -1 to 1
  label: string;
}

export default function SentimentGauge({ score, label }: SentimentGaugeProps) {
  // Convert -1 to 1 into 0 to 100 for display
  const percentage = ((score + 1) / 2) * 100;
  
  const getColor = () => {
    if (score < -0.3) return '#dc2626'; // red
    if (score < 0.1) return '#FF4500'; // reddit orange
    if (score < 0.4) return '#f97316'; // orange
    return '#22c55e'; // green
  };

  const getLabel = () => {
    if (score < -0.5) return 'Very Negative';
    if (score < -0.2) return 'Negative';
    if (score < 0.2) return 'Neutral';
    if (score < 0.5) return 'Positive';
    return 'Very Positive';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Sentiment arc */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${percentage * 4.4} 440`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {score > 0 ? '+' : ''}{score.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{getLabel()}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
  );
}
