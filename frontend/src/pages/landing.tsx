import { useState } from 'react';
import { Target, Sparkles, TrendingUp, Shield, Zap, Users, Check, ArrowRight, BarChart3, Globe, Boxes, Brain, MessageSquare, Database } from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Reddit:AI</span>
              <span className="text-xl font-bold text-gray-900">Reddit:AI</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="px-6 py-2 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold">
                Launch App →
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm font-semibold text-gray-900">YC Challenge • Reimagining Reddit with AI</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Reddit, <span className="text-[#FF4500]">Rebuilt for 2025</span><br />with AI at Its Core
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            What if Reddit launched today? <strong>Reddit:AI</strong> reimagines community discussions with Claude-powered insights, Letta AI moderation with memory, and instant sentiment intelligence. Not just analytics—a fundamentally AI-native platform.
          </p>

          <div className="flex items-center justify-center mb-12">
            <a href="/dashboard" className="px-8 py-4 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-bold text-lg shadow-lg hover:shadow-xl">
              Try Reddit:AI Free →
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>Claude AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Letta AI Moderation</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              <span>Persistent Memory</span>
            </div>
          </div>
        </div>
      </section>


      {/* Core Value Prop */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">"What if Reddit was founded today?"</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
            Reddit:AI is our answer—a platform where <strong>AI is the foundation</strong>, not an add-on. 
            Instant insights, intelligent moderation with memory, and sentiment understanding built into every thread.
          </p>

          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Claude Analysis</h3>
              <p className="text-sm text-gray-600">Instant sentiment, emotion, and theme extraction</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Letta Moderation</h3>
              <p className="text-sm text-gray-600">AI with memory that learns your community</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#FF4500]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Insights</h3>
              <p className="text-sm text-gray-600">Watch sentiment and trends as they happen</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#FF4500] to-[#ff5722] px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Make Sense of Reddit?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of moderators, researchers, and brands using Reddit:AI
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/dashboard" className="px-8 py-4 bg-white text-[#FF4500] rounded-full hover:bg-gray-100 transition font-bold text-lg">
              Start Analyzing Now →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Reddit:AI</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered Reddit intelligence for everyone.</p>
            </div>
            <span className="font-bold text-lg">Reddit:AI</span>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Reddit:AI. Built for Cal Hacks 12.0 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
