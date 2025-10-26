# Reddit:AI

> **AI-Powered Reddit Intelligence Platform for Cal Hacks 12.0**

What if Reddit launched today? Reddit:AI is our AI-native reimagining of a classic YC company, designed as if it were founded in 2025 with AI at its core. Claude-powered analysis delivers instant sentiment, emotion, theme extraction across threads, while real-time insights make trends visible as they happen and automatic content moderation (no more human-hours wasted). This submission answers the _YC challenge_ to rebuild a pre-2022 company for the post-ChatGPT world, not by copying, but by putting AI in the driver's seat.

Moderation isn't one-off; communities have memory. We integrate _Letta_ to power agents with persistent memory that learn each subreddit's norms over time, enabling context-aware moderation, consistent enforcement across threads, and durable awareness of patterns, topics, and user behavior. It's an adaptive, AI-native community engine.

## Features

### Dashboard (AI Analytics + Moderation)
- **Claude Insights**: instant sentiment, emotions, theme extraction
- **Toxicity & Controversy**: early warning for harmful or divisive threads
- **Keyword Cloud**: trending topics and entities at a glance
- **Moderation**: memory-aware, context-consistent actions across threads (powered by Letta)
- **Real-Time Updates**: watch discussion dynamics shift live

### Multi-Thread Comparison
- Compare 2–5 threads side-by-side
- Automatic rankings: Most Positive, Most Toxic, Most Controversial
- Unified view of sentiment, toxicity, themes, and engagement

### Side Features (History & More)
- **History & Saved Analyses**: revisit past threads and results
- **Thread Timelines**: track sentiment over time (per thread)
- **Export-Ready Summaries**: short TL;DRs for reports and sharing

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Anthropic API key (optional: OpenAI/Gemini)
- Optional: Letta API key (for moderation)

### Setup

1) Environment
```bash
cp .env.example .env   # or copy manually on Windows
# Fill in ANTHROPIC_API_KEY (optional: LETTA_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY)
```

2) Backend
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

3) Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

4) Access
- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Subreddits, example:
 - http://localhost:3000/r/askreddit
 - http://localhost:3000/r/science

**Example Threads to Try:**
- https://www.reddit.com/r/AskReddit/comments/js8e1z/
- https://www.reddit.com/r/technology/comments/...
- Any public Reddit discussion!

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 + React 18 + TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide Icons
- Framer Motion (ready for animations)

**Backend:**
- FastAPI (Python)
- Anthropic Claude AI (Haiku model)
- HTTPx for async HTTP
- Reddit JSON API scraping

## 📡 API Endpoints

- `GET /health` - Health check with API status
- `POST /api/summarize` - Generate 3-sentence thread summary
- `POST /api/analyze` - Full analysis (sentiment, emotions, keywords, toxicity, themes)
- `POST /api/compare` - Compare 2-5 threads side-by-side

## 📁 Project Structure

```
root/
├── backend/
│   └── main.py                 # FastAPI server with AI integration
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Next.js routes
│   │   │   ├── index.tsx       # Simple view
│   │   │   ├── dashboard.tsx   # Advanced analytics
│   │   │   └── ...
│   │   └── styles/
│   ├── package.json
│   └── tailwind.config.js
├── .env.example                # Sample environment variables
├── .env                        # Local environment (ignored)
└── README.md                   # Detailed Cal Hacks submission doc
```

## 🎬 Demo

**Walkthrough/Live Demo:** TBA

## 🎯 Use Cases

- **Moderators**: Detect toxic discussions early, track community sentiment
- **Researchers**: Analyze public opinion, extract themes, export data
- **Brands**: Monitor product mentions, compare competitor threads
- **Power Users**: Get TL;DR summaries, understand controversy before engaging