# Reddit:AI

> **AI-Native Reddit Intelligence & Moderation Platform (Built for Cal Hacks 12.0 | YC Rebuild Challenge)**

**Reddit:AI reimagines Reddit as if it were founded in 2025—with AI as the core engine, not an add-on.** Instead of static feeds and manual moderation, threads become real-time intelligence streams powered by Claude, and moderation evolves via persistent-memory Letta agents that learn community norms over time.

---

## 🚀 Why It’s Special

✅ **AI-native from the ground up** (not AI “added later”)
✅ **Real-time sentiment, emotion & toxicity analysis across live threads**
✅ **Subreddit-specific agents with memory → context-aware, evolving moderation**
✅ **Multi-thread comparison like Spotify Wrapped for conversations**
✅ **Autonomous moderation decisions with explainable JSON outputs**
✅ **Designed to answer the YC challenge: “Rebuild a pre-2022 company for the post-ChatGPT world”**

---

## 📊 Core Features

### 🧠 AI Dashboard

* Instant sentiment, emotion, theme & toxicity scoring
* Keyword clouds + early warning for high-controversy threads
* Real-time dynamics: watch conversations evolve live
* Letta-powered moderation: memory-aware, subreddit-specific enforcement

### ⚖️ Multi-Thread Comparison

* Compare up to 5 threads side-by-side
* Auto-rank: Most Positive, Most Toxic, Most Controversial
* Unified visuals across sentiment, themes, engagement

### 📚 History & Reports

* Saved analyses
* Thread-level sentiment timelines
* Export-ready TL;DRs

---

## ⚙️ Quick Start

### Prereqs

* Python 3.10+
* Node.js 18+
* Anthropic API key (optional: OpenAI/Gemini)
* Optional: Letta API key for moderation agents

### Setup

```bash
cp .env.example .env
# Add ANTHROPIC_API_KEY, optional LETTA_API_KEY, etc.
```

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Open:
👉 App: `http://localhost:3000`
👉 Dashboard: `/dashboard`
👉 Try threads from any public subreddit

---

## 🛠 Tech Stack

| Layer       | Tools                                                       |
| ----------- | ----------------------------------------------------------- |
| Frontend    | Next.js 15, React 18, TS, Tailwind, Recharts, Framer Motion |
| Backend     | FastAPI, HTTPx                                              |
| AI Engine   | Claude (Haiku), Letta (stateful agents, shared memory blocks)|
| Data Source | Reddit JSON API                                             |

---

## 🎥 Demo Links

* 📹 Walkthrough: [YouTube](https://www.youtube.com/watch?v=Urjalmce2hs)
* 📄 Devpost: [Link](https://devpost.com/software/redditai)

---

## 💡 Why It Works (YC Angle)

Reddit:AI turns passive forums into living intelligence feeds with memory-aware agents. Each subreddit becomes a learning entity with evolving cultural norms, enabling adaptive moderation and trend forecasting—something legacy platforms can’t retroactively bolt on.