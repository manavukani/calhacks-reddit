import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EmotionChartProps {
  emotions: {
    angry?: number;
    happy?: number;
    sad?: number;
    fearful?: number;
    surprised?: number;
  };
}

export default function EmotionChart({ emotions }: EmotionChartProps) {
  const data = [
    { name: 'Happy', value: emotions.happy || 0, color: '#22c55e' },
    { name: 'Surprised', value: emotions.surprised || 0, color: '#FF4500' },
    { name: 'Angry', value: emotions.angry || 0, color: '#dc2626' },
    { name: 'Fearful', value: emotions.fearful || 0, color: '#f97316' },
    { name: 'Sad', value: emotions.sad || 0, color: '#6366f1' },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value}%`, 'Percentage']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
