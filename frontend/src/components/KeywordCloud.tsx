import React from 'react';

interface KeywordCloudProps {
  keywords: string[];
}

export default function KeywordCloud({ keywords }: KeywordCloudProps) {
  const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
  const colors = [
    'text-[#FF4500]',
    'text-orange-600',
    'text-[#FF5722]',
    'text-red-600',
    'text-orange-700',
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
      {keywords.map((keyword, idx) => {
        const sizeClass = sizes[Math.min(idx, sizes.length - 1)];
        const colorClass = colors[idx % colors.length];
        return (
          <span
            key={idx}
            className={`${sizeClass} ${colorClass} font-semibold hover:scale-110 transition-transform cursor-default`}
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {keyword}
          </span>
        );
      })}
    </div>
  );
}
