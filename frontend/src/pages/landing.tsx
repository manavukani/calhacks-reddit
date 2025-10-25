import { useState } from 'react';
import { Target, Sparkles, TrendingUp, Shield, Zap, Users, Check, ArrowRight, BarChart3, Globe, Boxes } from 'lucide-react';

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
              <span className="text-xl font-bold text-gray-900">ThreadSense</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-[#FF4500] transition">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-[#FF4500] transition">Pricing</a>
              <a href="/dashboard" className="px-4 py-2 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-semibold">
                Launch App →
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm font-semibold text-[#FF4500]">Powered by Claude AI • Now in Beta</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Turn Reddit Chaos<br />Into <span className="text-[#FF4500]">Actionable Intelligence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered sentiment analysis, toxicity detection, and thread comparison. 
            Built for moderators, researchers, and brands who need instant Reddit insights.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <a href="/dashboard" className="px-8 py-4 bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] transition font-bold text-lg shadow-lg hover:shadow-xl">
              Start Analyzing Free
            </a>
            <a href="#demo" className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-full hover:border-[#FF4500] hover:text-[#FF4500] transition font-semibold text-lg">
              Watch Demo
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>10 free analyses/day</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No Reddit API needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#FF4500] mb-2">500M+</div>
              <div className="text-gray-600">Reddit Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4500] mb-2">&lt;5s</div>
              <div className="text-gray-600">Analysis Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4500] mb-2">90%+</div>
              <div className="text-gray-600">AI Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4500] mb-2">24/7</div>
              <div className="text-gray-600">Real-time Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features built for Reddit intelligence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sentiment Analysis</h3>
              <p className="text-gray-600">Real-time mood tracking with -1 to +1 scoring. Know exactly how communities feel.</p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Toxicity Detection</h3>
              <p className="text-gray-600">Identify harmful content early. Protect your community with AI-powered moderation.</p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Analytics</h3>
              <p className="text-gray-600">Beautiful charts, gauges, and word clouds. Turn data into insights instantly.</p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Boxes className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Thread Compare</h3>
              <p className="text-gray-600">Compare up to 5 threads side-by-side. Perfect for brand monitoring and research.</p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keyword Extraction</h3>
              <p className="text-gray-600">Automatically surface trending topics and themes. Never miss what matters.</p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-600">Works with public Reddit threads. No authentication or OAuth required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built For Everyone</h2>
            <p className="text-xl text-gray-600">From moderators to Fortune 500 brands</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-4xl mb-4">👮</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Moderators</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Detect toxic discussions early</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Track community sentiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Identify trending concerns</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Researchers</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Analyze public opinion at scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Extract themes automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Export citation-ready data</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Brands</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Monitor product mentions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Compare competitor sentiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Track sentiment trends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>10 analyses per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Basic sentiment analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Keyword extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Visual dashboards</span>
                </li>
              </ul>
              <a href="/dashboard" className="block w-full py-3 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition font-semibold text-center">
                Start Free
              </a>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#FF4500] p-8 rounded-2xl border-2 border-[#FF4500] shadow-xl transform scale-105">
              <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-white/90">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-white">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited</strong> analyses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Advanced emotion tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Multi-thread comparison</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Export to PDF/JSON</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Analysis history</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-white text-[#FF4500] rounded-full hover:bg-gray-100 transition font-bold text-center">
                Start Pro Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Batch processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>SLA guarantees</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-semibold text-center">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#FF4500] to-[#ff5722] px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Make Sense of Reddit?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of moderators, researchers, and brands using ThreadSense
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
                <span className="font-bold">ThreadSense</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered Reddit intelligence for everyone.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                <li><a href="/api" className="hover:text-white transition">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 ThreadSense. Built for Cal Hacks 12.0 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
