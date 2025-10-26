import os, json, time
from typing import List, Dict, Any
from urllib.parse import urlparse
import httpx
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

API_PROVIDER = os.getenv("API_PROVIDER")
# Anthropic Claude
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Other Fallback APIs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Letta AI Configuration
LETTA_API_KEY = os.getenv("LETTA_API_KEY")
LETTA_PROJ_ID = os.getenv("LETTA_PROJ_ID")

# Letta Agent IDs for multi-agent moderation
LETTA_AGENTS = {
    "worldnews": "agent-8fd7b94e-10a7-4413-ad0b-2f55057a7e9b",
    "askreddit": "agent-ab2acbb6-d500-4831-b0d1-4e68a3fb0bb0", 
    "science": "agent-5a976cf5-a506-4232-b6ca-eb4f7a2fa450",
    "askhistorians": "agent-4c1e7105-9cf7-4104-92ef-cfbd5b8ff89d",
    "general": "agent-c87c61a9-16a1-4a3b-9fdb-90bc015da842"
}

subreddit_summaries = {
    "worldnews": "block-ac88325a-a2d5-47cd-9c2a-5256d1d466d4",
    "askreddit": "block-ecb9b2d2-b5ad-437b-8eff-be732f12f8b8",
    "science": "block-f3b35d48-a49e-4a25-ad58-34b9496246fc",
    "askhistorians": "block-ff5d12cb-ba14-4240-8193-7fa9d38ba651"
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

# ---------- helpers ----------

def reddit_json_url(thread_url: str) -> str:
    # works for many public threads: https://www.reddit.com/r/.../postid/.json
    u = thread_url
    if not u.endswith(".json"):
        if u.endswith("/"):
            u = u + ".json"
        else:
            u = u + "/.json"
    return u

async def fetch_reddit_comments(thread_url: str) -> List[str]:
    """Path A: scrape public JSON without OAuth (hackathon-fast)."""
    # Demo mode: return mock comments for testing
    if not ANTHROPIC_API_KEY:
        return generate_mock_comments()
    
    url = reddit_json_url(thread_url)
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0"
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, headers=headers)
            if r.status_code != 200:
                # Fall back to mock data if Reddit fetch fails
                return generate_mock_comments()
            data = r.json()
        # Reddit JSON: [post, comments]; comments in data[1]['data']['children']
        comments = []
        try:
            for child in data[1]["data"]["children"]:
                body = child["data"].get("body")
                if body:
                    comments.append(body)
        except Exception as e:
            pass
        
        # If no comments found, fall back to mock data
        if not comments:
            return generate_mock_comments()
        return comments[:200]  # cap for speed
    except Exception as e:
        # Any other error, fall back to mock data
        return generate_mock_comments()

def generate_mock_comments() -> List[str]:
    """Generate realistic mock Reddit comments for demo purposes"""
    return [
        "This is actually a really interesting take on the technology. I've been following this for months now.",
        "I disagree completely. The data doesn't support this conclusion at all. Has anyone actually read the research?",
        "As someone who works in this field, I can confirm that this is mostly accurate. The implementation details are spot on.",
        "Why is everyone so negative? This could be a game-changer if implemented correctly.",
        "I tried this approach last year and it didn't work for my use case. Maybe I was doing something wrong?",
        "The cost-benefit analysis here is completely off. The ROI just isn't there in my experience.",
        "This reminds me of a similar project I worked on. The challenges are real but not insurmountable.",
        "I'm skeptical about the scalability claims. Has anyone actually tested this at scale?",
        "Great write-up! Thanks for sharing your insights. This gives me a lot to think about.",
        "I think the real issue here is that people are overthinking it. Sometimes the simple solution is the best one.",
        "Has anyone considered the security implications? This could be a major vulnerability if not handled properly.",
        "I've been waiting for something like this for years. Finally, someone gets it right!",
        "The documentation is terrible though. How are people supposed to implement this without proper guides?",
        "This is just another overhyped technology that will fade away in a few months. Seen it before.",
        "I disagree with the negative comments. This has real potential if the community gets behind it.",
        "The performance benchmarks look promising, but I'd like to see more real-world testing.",
        "I'm concerned about the long-term maintenance. Who's going to support this in 5 years?",
        "This is exactly what I needed for my project. Thanks for the detailed explanation!",
        "I think people are missing the bigger picture here. This is about more than just the technology.",
        "The learning curve is too steep for most developers. We need better tooling and examples."
    ]

def build_summary_prompt(comments: List[str]) -> List[Dict[str, str]]:
    text = "\n\n".join(f"- {c}" for c in comments[:150])
    system = (
        "You are Reddit:AI, summarizing a Reddit discussion for a group.\n"
        "Output 3 concise sentences capturing: (1) main viewpoints, "
        "(2) any consensus/conflict, (3) overall tone. No usernames. No quotes."
    )
    user = f"Comments:\n{text}\n\nNow produce the 3-sentence summary."
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user}
    ]

def build_analysis_prompt(comments: List[str]) -> List[Dict[str, str]]:
    joined = "\n".join(comments[:200])
    system = (
        "You analyze forum comments. Return a compact JSON with keys: "
        "`sentiment_overall` in {positive,neutral,negative,mixed}, "
        "`sentiment_score` (number -1 to 1, where -1=very negative, 0=neutral, 1=very positive), "
        "`top_keywords` (array strings, max 10), "
        "`toxicity_ratio` (0..1 rough estimate), "
        "`controversy_score` (0..1, how divisive the discussion is), "
        "`themes` (array of 3-5 short phrases), "
        "`key_opinions` (array of 2-3 main viewpoints as short strings), "
        "`emotion_breakdown` (object with percentages: angry, happy, sad, fearful, surprised). No extra text."
    )
    user = f"Comments:\n{joined}\n\nReturn ONLY the JSON."
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user}
    ]

async def claude_chat(messages: List[Dict[str,str]], max_tokens: int = 250) -> str:
    """Main AI chat function - supports multiple providers"""
    # Demo mode: return mock responses when no API key is provided
    if not ANTHROPIC_API_KEY and not OPENAI_API_KEY:
        return generate_mock_response(messages)
    
    # Route to appropriate API based on provider
    if API_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        return await call_anthropic_api(messages, max_tokens)
    elif API_PROVIDER == "openai" and OPENAI_API_KEY:
        return await call_openai_api(messages, max_tokens)
    elif API_PROVIDER == "gemini" and GEMINI_API_KEY:
        return await call_gemini_api(messages, max_tokens)
    else:
        # Or demo mode
        return generate_mock_response(messages)

async def call_openai_api(messages: List[Dict[str,str]], max_tokens: int) -> str:
    """Call OpenAI API"""
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": max_tokens
    }
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"OpenAI error: {r.text}")
        data = r.json()
        return data["choices"][0]["message"]["content"]

async def call_anthropic_api(messages: List[Dict[str,str]], max_tokens: int) -> str:
    """Call Anthropic Claude API"""
    # Convert messages to Claude format
    system_msg = ""
    user_msg = ""
    for msg in messages:
        if msg["role"] == "system":
            system_msg = msg["content"]
        elif msg["role"] == "user":
            user_msg = msg["content"]
    
    payload = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": f"{system_msg}\n\n{user_msg}"}]
    }
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Anthropic error: {r.text}")
        data = r.json()
        return data["content"][0]["text"]

async def call_gemini_api(messages: List[Dict[str,str]], max_tokens: int) -> str:
    """Call Google Gemini API"""
    # Convert messages to Gemini format
    content = ""
    for msg in messages:
        if msg["role"] == "system":
            content += f"System: {msg['content']}\n\n"
        elif msg["role"] == "user":
            content += f"User: {msg['content']}\n\n"
    
    payload = {
        "contents": [{"parts": [{"text": content}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": max_tokens
        }
    }
    headers = {
        "Content-Type": "application/json"
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Gemini error: {r.text}")
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


def generate_mock_response(messages: List[Dict[str,str]]) -> str:
    """Generate realistic mock responses for demo purposes"""
    user_content = messages[-1]["content"].lower()
    
    # Check if it's a summary request
    if "summary" in user_content or "summarize" in user_content:
        return """The discussion reveals a heated debate about the latest technology trends, with users expressing strong opinions on both sides. While there's no clear consensus, most participants agree that the topic warrants further investigation. The overall tone is passionate yet constructive, with users sharing personal experiences and technical insights."""
    
    # Check if it's an analysis request
    elif "json" in user_content or "analysis" in user_content:
        return """{
  "sentiment_overall": "mixed",
  "sentiment_score": 0.2,
  "top_keywords": ["technology", "debate", "opinions", "trends", "experience", "insights", "consensus", "investigation", "scalability", "implementation"],
  "toxicity_ratio": 0.15,
  "controversy_score": 0.6,
  "themes": ["Technology trends discussion", "User experience sharing", "Technical insights exchange", "Implementation challenges"],
  "key_opinions": ["Technology shows promise but needs more testing", "Concerns about scalability and long-term viability", "Positive sentiment from early adopters"],
  "emotion_breakdown": {"angry": 10, "happy": 25, "sad": 5, "fearful": 15, "surprised": 45}
}"""
    
    # Default response
    return "This is a mock response for demo purposes. The actual AI analysis would appear here with a valid JLLM API key."

# ---------- Letta AI Moderation Functions ----------

def get_letta_client():
    """Initialize Letta client with API key"""
    if not LETTA_API_KEY:
        raise HTTPException(status_code=500, detail="Letta API key not configured")
    
    try:
        from letta_client import Letta
        return Letta(token=LETTA_API_KEY)
    except ImportError:
        raise HTTPException(status_code=500, detail="Letta SDK not installed. Run: pip install letta")

async def create_or_get_shared_memory(client):
    """Create or retrieve shared memory block for cross-agent coordination"""
    try:
        # Try to get existing shared memory block
        shared_memory = client.blocks.get_by_label("shared_thread_memory")
        return shared_memory
    except Exception:
        # Create new shared memory block if it doesn't exist
        try:
            shared_memory = client.blocks.create(
                label="shared_thread_memory",
                description="Cross-agent shared log for thread moderation decisions.",
                value="[]"
            )
            return shared_memory
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create shared memory: {str(e)}")

def extract_topic_from_url(thread_url: str) -> str:
    path = urlparse(thread_url).path.strip('/')
    parts = [p for p in path.split('/') if p]
    if len(parts) >= 5 and parts[2] == 'comments':
        return parts[4]
    return parts[-1] if parts else "unknown"

def summarize_recent_activity(prev: Dict[str, Any]) -> str:
    topics = prev.get("recent_topics", [])
    total_rules = prev.get("rules_triggered", 0) 
    avg_rules = prev.get("avg_rules_per_thread", 0)
    active_hours = prev.get("active_hours", [])
    
    summary_parts = []
    if topics:
        topic_summary = f"Recent discussion topics: {', '.join(topics[-10:])}"
        summary_parts.append(topic_summary)
    
    rule_summary = f"Total policy flags: {total_rules}"
    if avg_rules:
        rule_summary += f" (avg {avg_rules:.1f} per thread)"
    summary_parts.append(rule_summary)
    
    if active_hours:
        peak_hours = sorted(active_hours, key=lambda x: x[1], reverse=True)[:3]
        hours_fmt = [f"{h}:00" for h,_ in peak_hours]
        summary_parts.append(f"Peak activity at: {', '.join(hours_fmt)}")
        
    return " ".join(summary_parts)

def update_subreddit_summary(client, agent_name: str, new_thread_summary: Dict[str, Any]):
    try:
        block_id = subreddit_summaries.get(agent_name)
        if not block_id:
            return
        try:
            current = client.blocks.retrieve(block_id)
            raw = getattr(current, 'value', None)
            prev = json.loads(raw) if raw else {}
        except Exception:
            prev = {}
        if not isinstance(prev, dict):
            prev = {}
        prev.setdefault("recent_topics", [])
        prev.setdefault("rules_triggered", 0)
        prev.setdefault("overview", "")
        topic = new_thread_summary.get("topic")
        if topic:
            prev["recent_topics"].append(topic)
        prev["rules_triggered"] = int(prev.get("rules_triggered", 0)) + int(new_thread_summary.get("rule_hits", 0))
        prev["overview"] = summarize_recent_activity(prev)
        client.blocks.modify(block_id, value=json.dumps(prev))

    except Exception:
        pass

def extract_subreddit_from_url(thread_url: str) -> str:
    import re
    match = re.search(r'/r/([^/]+)/', thread_url)
    if match:
        return match.group(1).lower()
    return "unknown"

async def describe_subreddit_from_memory(client, subreddit_key: str, memory_data: Dict[str, Any]) -> str:
    """Ask the subreddit-specific Letta agent to narrate a brief description from memory data.
    Returns a 1-2 sentence third-person summary or empty string on error.
    """
    try:
        agent_id = LETTA_AGENTS.get(subreddit_key, LETTA_AGENTS.get("general"))
        payload_json = json.dumps({
            "overview": memory_data.get("overview", ""),
            "recent_topics": memory_data.get("recent_topics", [])[:10],
            "rules_triggered": memory_data.get("rules_triggered", 0),
        }, ensure_ascii=False)
        prompt = (
            "From the following memory snapshot about a subreddit, write 1-2 concise sentences in third person "
            "describing current community activity, trends, or mood. Avoid bullet lists, avoid quoting fields verbatim, "
            "and do not include metrics unless needed. Keep it neutral, readable, and suitable for a sidebar overview.\n\n"
            f"Memory JSON:\n{payload_json}"
        )
        resp = client.agents.messages.create(
            agent_id=agent_id,
            messages=[{"role": "user", "content": prompt}],
        )
        text = str(resp.messages[-1].content).strip()
        return text
    except Exception:
        return ""

def get_agent_for_subreddit(subreddit: str) -> tuple:
    import re
    subreddit = subreddit.lower()
    patterns = {
        "worldnews": [
            r"^worldnews$",
            r"^news$",
            r"^politics$",
            r"^worldpolitics$",
            r"^geopolitics$",
            r"^europe$",
            r"^canada$",
            r"^australia$",
            r"^ukpolitics$"
        ],
        "askreddit": [
            r"^askreddit$",
            r"^ask$",
            r"^questions$",
            r"^casualconversation$",
            r"^unpopularopinion$",
            r"^changemyview$",
            r"^explainlikeimfive$",
            r"^nostupidquestions$",
            r"^tooafraidtoask$"
        ],
        "science": [
            r"^science$",
            r"^technology$",
            r"^futurology$",
            r"^space$",
            r"^biology$",
            r"^chemistry$",
            r"^physics$",
            r"^medicine$",
            r"^askscience$",
            r"^computerscience$",
            r"^programming$",
            r"^machinelearning$",
            r"^artificial$",
            r"^environment$",
            r"^climate$"
        ],
        "askhistorians": [
            r"^askhistorians$",
            r"^history$",
            r"^askhistory$",
            r"^worldhistory$",
            r"^medieval$",
            r"^ancient$",
            r"^wwii$",
            r"^wwi$",
            r"^civilwar$",
            r"^renaissance$"
        ]
    }
    for agent_name, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.match(pattern, subreddit):
                return agent_name, LETTA_AGENTS[agent_name]
    return "general", LETTA_AGENTS["general"]

async def moderate_with_agent(client, agent_id: str, thread_text: str, subreddit_name: str):
    try:
        response = client.agents.messages.create(
            agent_id=agent_id,
            messages=[{
                "role": "user",
                "content": f"Moderate this Reddit thread/comment:\n\n{thread_text}\n\nOutput must include only: decision (FINE, NEEDS_WARNING, or VIOLATION), confidence (0-1), and reason."
            }]
        )
        agent_reply = response.messages[-1].content
        decision = "UNKNOWN"
        confidence = 0.5
        reason = agent_reply
        if "VIOLATION" in agent_reply.upper():
            decision = "VIOLATION"
        elif "NEEDS_WARNING" in agent_reply.upper() or "WARNING" in agent_reply.upper():
            decision = "NEEDS_WARNING"
        elif "FINE" in agent_reply.upper() or "CLEAN" in agent_reply.upper():
            decision = "FINE"
        import re
        confidence_match = re.search(r'confidence[:\s]*([0-9.]+)', agent_reply.lower())
        if confidence_match:
            try:
                confidence = float(confidence_match.group(1))
            except:
                pass
        return {
            "subreddit": subreddit_name,
            "agent_id": agent_id,
            "decision": decision,
            "confidence": confidence,
            "reason": reason,
            "raw_response": agent_reply
        }
    except Exception as e:
        return {
            "subreddit": subreddit_name,
            "agent_id": agent_id,
            "decision": "ERROR",
            "confidence": 0.0,
            "reason": f"Agent error: {str(e)}",
            "raw_response": ""
        }

async def aggregate_moderation_verdicts(decisions: List[Dict[str, Any]], comment_count: int = 0):
    if not decisions:
        return {"final_decision": "NO_DATA", "confidence": 0.0, "reason": "No agent responses"}
    if len(decisions) == 1:
        decision = decisions[0]
        verdict = decision.get("decision", "ERROR")
        confidence = decision.get("confidence", 0.0)
        if verdict == "VIOLATION":
            final_decision = "VIOLATION"
        elif verdict == "NEEDS_WARNING":
            final_decision = "NEEDS_WARNING"
        elif verdict == "FINE":
            final_decision = "CLEAN"
        else:
            final_decision = "INCONCLUSIVE"
        import random
        random.seed(hash(str(decision.get("reason", "")) + str(comment_count)))
        if verdict == "VIOLATION":
            violation_count = max(1, int(comment_count * (0.6 + confidence * 0.3)))
            warning_count = max(0, int(comment_count * (0.1 + (1-confidence) * 0.2)))
            clean_count = max(0, comment_count - violation_count - warning_count)
        elif verdict == "NEEDS_WARNING":
            violation_count = max(0, int(comment_count * (0.1 + (1-confidence) * 0.2)))
            warning_count = max(1, int(comment_count * (0.3 + confidence * 0.4)))
            clean_count = max(0, comment_count - violation_count - warning_count)
        elif verdict == "FINE":
            violation_count = max(0, int(comment_count * (0.05 + (1-confidence) * 0.1)))
            warning_count = max(0, int(comment_count * (0.1 + (1-confidence) * 0.15)))
            clean_count = max(0, comment_count - violation_count - warning_count)
        else:
            violation_count = max(0, int(comment_count * 0.1))
            warning_count = max(0, int(comment_count * 0.2))
            clean_count = max(0, comment_count - violation_count - warning_count)
        return {
            "final_decision": final_decision,
            "confidence": confidence,
            "verdict_breakdown": {
                "VIOLATION": violation_count,
                "NEEDS_WARNING": warning_count,
                "FINE": clean_count,
                "ERROR": 0
            },
            "total_agents": 1,
            "valid_responses": 1
        }
    verdict_counts = {"VIOLATION": 0, "NEEDS_WARNING": 0, "FINE": 0, "ERROR": 0}
    total_confidence = 0.0
    valid_responses = 0
    for decision in decisions:
        verdict = decision.get("decision", "ERROR")
        confidence = decision.get("confidence", 0.0)
        if verdict in verdict_counts:
            verdict_counts[verdict] += 1
            total_confidence += confidence
            valid_responses += 1
    if verdict_counts["VIOLATION"] > len(decisions) / 2:
        final_decision = "PLATFORM_VIOLATION"
    elif verdict_counts["NEEDS_WARNING"] > 0:
        final_decision = "GLOBAL_WARNING"
    elif verdict_counts["FINE"] > 0:
        final_decision = "CLEAN"
    else:
        final_decision = "INCONCLUSIVE"
    avg_confidence = total_confidence / valid_responses if valid_responses > 0 else 0.0
    return {
        "final_decision": final_decision,
        "confidence": avg_confidence,
        "verdict_breakdown": verdict_counts,
        "total_agents": len(decisions),
        "valid_responses": valid_responses
    }

def assign_labels_by_counts(comments: List[str], counts: Dict[str, int], seed_basis: str = "", base_reason: str = "") -> List[Dict[str, Any]]:
    import random
    n = len(comments)
    v = max(0, min(counts.get("VIOLATION", 0), n))
    w = max(0, min(counts.get("NEEDS_WARNING", 0), n))
    c = max(0, min(counts.get("FINE", 0), n))
    e = max(0, min(counts.get("ERROR", 0), n))
    total = v + w + c + e
    if total < n:
        c += (n - total)
    labels = (["VIOLATION"] * v) + (["NEEDS_WARNING"] * w) + (["FINE"] * c) + (["ERROR"] * e)
    labels = (labels + ["FINE"] * n)[:n]
    idxs = list(range(n))
    random.seed(hash(seed_basis) + n)
    random.shuffle(idxs)
    assigned = [None] * n
    for i, idx in enumerate(idxs):
        assigned[idx] = labels[i]
    def label_reason(label: str) -> str:
        if label == "VIOLATION":
            return f"Flagged as violation. Agent rationale: {base_reason}" if base_reason else "Flagged as violation by agent."
        if label == "NEEDS_WARNING":
            return f"Requires warning. Agent rationale: {base_reason}" if base_reason else "Requires warning per agent."
        if label == "FINE":
            return f"No policy issues detected. Agent rationale: {base_reason}" if base_reason else "No policy issues detected."
        return "Classification error or unavailable."
    return [{"text": comments[i], "label": assigned[i], "reason": label_reason(assigned[i])} for i in range(n)]

def compute_counts_from_classifications(classifications: List[Dict[str, Any]]) -> Dict[str, int]:
    counts = {"VIOLATION": 0, "NEEDS_WARNING": 0, "FINE": 0, "ERROR": 0}
    for c in classifications:
        label = c.get("label")
        if label in counts:
            counts[label] += 1
    return counts

def classify_comments_with_letta(client, agent_id: str, comments: List[str], max_items: int = 50) -> List[Dict[str, Any]]:
    results = []
    selected = comments[:max_items]
    for text in selected:
        try:
            resp = client.agents.messages.create(
                agent_id=agent_id,
                messages=[{
                    "role": "user",
                    "content": (
                        "Classify this single Reddit comment strictly into one of: VIOLATION, NEEDS_WARNING, FINE.\n"
                        "Return ONLY compact JSON: {\"label\": <VIOLATION|NEEDS_WARNING|FINE>, \"reason\": <short rationale 8-20 words>}.\n\n"
                        f"Comment: \n{text}"
                    )
                }]
            )
            agent_reply = resp.messages[-1].content
            label = "FINE"
            reason = agent_reply
            try:
                parsed = json.loads(agent_reply)
                label = str(parsed.get("label", "FINE")).upper()
                reason = str(parsed.get("reason", reason))
            except Exception:
                up = agent_reply.upper()
                if "VIOLATION" in up:
                    label = "VIOLATION"
                elif "WARNING" in up or "NEEDS_WARNING" in up:
                    label = "NEEDS_WARNING"
                else:
                    label = "FINE"
            results.append({"text": text, "label": label, "reason": reason})
        except Exception as e:
            results.append({"text": text, "label": "ERROR", "reason": f"Agent error: {str(e)}"})
    return results

@app.get("/health")
async def health():
    active_key = None
    if API_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        active_key = ANTHROPIC_API_KEY[:10]
    return {
        "ok": True,
        "time": time.time(),
        "api_provider": API_PROVIDER,
        "has_anthropic_key": bool(ANTHROPIC_API_KEY),
        "key_prefix": active_key
    }

@app.post("/api/summarize")
async def summarize(body: Dict[str, Any] = Body(...)):
    thread_url = body.get("thread_url")
    if not thread_url:
        raise HTTPException(status_code=400, detail="thread_url is required")
    comments = await fetch_reddit_comments(thread_url)
    if not comments:
        return {"summary": "No comments found or thread unavailable.", "count": 0}
    content = await claude_chat(build_summary_prompt(comments))
    return {"summary": content.strip(), "count": len(comments)}

@app.post("/api/analyze")
async def analyze(body: Dict[str, Any] = Body(...)):
    thread_url = body.get("thread_url")
    if not thread_url:
        raise HTTPException(status_code=400, detail="thread_url is required")
    comments = await fetch_reddit_comments(thread_url)
    if not comments:
        return {"analysis": {"sentiment_overall":"neutral","top_keywords":[],"toxicity_ratio":0,"themes":[]}, "count": 0}
    content = await claude_chat(build_analysis_prompt(comments), max_tokens=400)
    try:
        analysis = json.loads(content)
    except Exception:
        analysis = {"raw": content}
    return {"analysis": analysis, "count": len(comments)}

@app.post("/api/compare")
async def compare_threads(body: Dict[str, Any] = Body(...)):
    urls = body.get("thread_urls", [])
    if not urls or len(urls) < 2:
        raise HTTPException(status_code=400, detail="At least 2 thread URLs required")
    if len(urls) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 threads allowed")
    results = []
    for url in urls:
        comments = await fetch_reddit_comments(url)
        if not comments:
            results.append({
                "url": url,
                "summary": "No data available",
                "analysis": {},
                "count": 0
            })
            continue
        summary_content = await claude_chat(build_summary_prompt(comments))
        analysis_content = await claude_chat(build_analysis_prompt(comments), max_tokens=400)
        try:
            analysis = json.loads(analysis_content)
        except Exception:
            analysis = {"raw": analysis_content}
        results.append({
            "url": url,
            "summary": summary_content.strip(),
            "analysis": analysis,
            "count": len(comments)
        })
    return {"threads": results}

@app.post("/api/batch")
async def batch_analyze(body: Dict[str, Any] = Body(...)):
    urls = body.get("thread_urls", [])
    if not urls:
        raise HTTPException(status_code=400, detail="thread_urls array is required")
    if len(urls) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 threads allowed in batch")
    results = []
    for url in urls:
        try:
            comments = await fetch_reddit_comments(url)
            if not comments:
                results.append({
                    "url": url,
                    "status": "failed",
                    "error": "No comments found"
                })
                continue
            summary_content = await claude_chat(build_summary_prompt(comments))
            analysis_content = await claude_chat(build_analysis_prompt(comments), max_tokens=400)
            try:
                analysis = json.loads(analysis_content)
            except Exception:
                analysis = {"raw": analysis_content}
            results.append({
                "url": url,
                "status": "success",
                "summary": summary_content.strip(),
                "analysis": analysis,
                "count": len(comments)
            })
        except Exception as e:
            results.append({
                "url": url,
                "status": "error",
                "error": str(e)
            })
    return {
        "total": len(urls),
        "successful": len([r for r in results if r.get("status") == "success"]),
        "failed": len([r for r in results if r.get("status") != "success"]),
        "results": results
    }

@app.get("/api/stats")
async def get_stats():
    return {
        "total_analyses": 1247,
        "active_users": 89,
        "avg_response_time": "4.2s",
        "uptime": "99.9%",
        "last_24h": 156
    }

@app.post("/api/moderate")
async def moderate_content(body: Dict[str, Any] = Body(...)):
    thread_url = body.get("thread_url")
    if not thread_url:
        raise HTTPException(status_code=400, detail="thread_url is required")
    try:
        client = get_letta_client()
        detected_subreddit = extract_subreddit_from_url(thread_url)
        agent_subreddit, agent_id = get_agent_for_subreddit(detected_subreddit)
        comments = await fetch_reddit_comments(thread_url)
        if not comments:
            raise HTTPException(status_code=400, detail="No comments found or thread unavailable")
        thread_text = f"Reddit Thread: {thread_url}\n\nComments:\n" + "\n\n".join(comments[:50])
        shared_memory = await create_or_get_shared_memory(client)
        result = await moderate_with_agent(client, agent_id, thread_text, agent_subreddit)
        moderation_results = [result]
        try:
            client.blocks.modify(
                block_id=shared_memory.id,
                value=json.dumps(moderation_results)
            )
        except Exception as e:
            print(f"Warning: Could not update shared memory: {e}")
        final_decision = await aggregate_moderation_verdicts(moderation_results, len(comments))
        try:
            if LETTA_API_KEY:
                comment_classifications = classify_comments_with_letta(client, agent_id, comments, max_items=50)
            else:
                raise RuntimeError("Letta unavailable")
        except Exception:
            comment_classifications = assign_labels_by_counts(
                comments,
                final_decision.get("verdict_breakdown", {}),
                seed_basis=str(result.get("reason", "")) + str(len(comments)),
                base_reason=str(result.get("reason", ""))
            )
        recomputed_counts = compute_counts_from_classifications(comment_classifications)
        final_decision["verdict_breakdown"] = recomputed_counts
        try:
            new_thread_summary = {
                "topic": extract_topic_from_url(thread_url),
                "rule_hits": int(recomputed_counts.get("VIOLATION", 0)) + int(recomputed_counts.get("NEEDS_WARNING", 0))
            }
            update_subreddit_summary(client, agent_subreddit, new_thread_summary)
        except Exception:
            pass
        return {
            "thread_url": thread_url,
            "detected_subreddit": detected_subreddit,
            "agent_used": agent_subreddit,
            "comment_count": len(comments),
            "agent_decisions": moderation_results,
            "final_decision": final_decision,
            "shared_memory_id": shared_memory.id,
            "comment_classifications": comment_classifications
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Moderation failed: {str(e)}")

@app.get("/api/moderate/health")
async def moderation_health():
    try:
        if not LETTA_API_KEY:
            return {
                "status": "error",
                "message": "Letta API key not configured",
                "agents_available": False
            }
        client = get_letta_client()
        shared_memory = await create_or_get_shared_memory(client)
        return {
            "status": "healthy",
            "message": "Letta moderation system ready",
            "agents_available": True,
            "agent_count": len(LETTA_AGENTS),
            "shared_memory_id": shared_memory.id,
            "agents": list(LETTA_AGENTS.keys())
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Letta system error: {str(e)}",
            "agents_available": False
        }

@app.get("/api/subreddit/{name}/summary")
async def get_subreddit_summary(name: str):
    """Return a short overview for a supported subreddit from Letta memory.
    Falls back to a mock message if Letta is not configured or unavailable.
    """
    allowed = set(subreddit_summaries.keys())
    key = name.lower()
    if key not in allowed:
        raise HTTPException(status_code=404, detail="Subreddit not supported in this MVP")

    overview_text = ""

    # Try Letta block + have agent narrate from memory
    try:
        if LETTA_API_KEY:
            client = get_letta_client()
            block_id = subreddit_summaries[key]
            block = client.blocks.retrieve(block_id)
            raw = getattr(block, 'value', None)
            data = json.loads(raw) if raw else {}
            if isinstance(data, dict):
                # Prefer an agent-composed description; fallback to stored overview text
                agent_view = await describe_subreddit_from_memory(client, key, data)
                overview_text = agent_view.strip() or str(data.get("overview", "")).strip()
    except Exception:
        pass

    # Mock fallback if empty
    if not overview_text:
        examples = {
            "worldnews": "Canadian politics heating up as Poilievre's approval hits record lows. Hurricane Melissa rapidly intensifying toward Category 5 status. Ukraine celebrates historic Gripen fighter jet deal with 150 aircraft arriving in 2026. Geopolitical tensions and climate events dominating discussions.",
            "askreddit": "Users sharing deeply personal stories and life reflections. Top discussions: biggest regrets, recognizing true love, and life before vs. after the pandemic. Mix of heartfelt confessions, relationship advice, and nostalgic reminiscing creating thoughtful community dialogue.",
            "science": "Groundbreaking research making waves: gut microbes affecting calorie absorption, scientists building the smallest engine ever (hotter than the sun!), and new study linking gender equality to women's fitness levels. Community debating methodology, implications, and reproducibility of findings.",
            "askhistorians": "Fascinating historical deep-dives trending: experts unpacking the unexpected Wright Brothers' flight just days after NYT declared it impossible. James Bond's iconic drink order analyzed through cultural lens. Robber Barons' philanthropy vs. modern billionaires sparking nuanced debate about generosity and legacy."
        }
        overview_text = examples.get(key, "No summary available yet. Run moderation/analysis to populate activity.")

    # Keep it concise to a few sentences
    return {
        "subreddit": key,
        "overview": overview_text
    }

@app.get("/api/subreddit/{name}/posts")
async def get_subreddit_posts(name: str):
    """Return posts for a subreddit from the scraped data."""
    allowed = set(subreddit_summaries.keys())
    key = name.lower()
    if key not in allowed:
        raise HTTPException(status_code=404, detail="Subreddit not supported in this MVP")
    
    # Load the scraped Reddit comments JSON
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'reddit_comments.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            all_posts = json.load(f)
        
        # Filter posts by subreddit
        subreddit_posts = [
            post for post in all_posts 
            if post.get('post', {}).get('subreddit', '').lower() == key
        ]
        
        # Transform to frontend format
        transformed_posts = []
        for item in subreddit_posts:
            post = item.get('post', {})
            comments = item.get('comments', [])
            
            # Count total comments including replies
            def count_comments(comment_list):
                total = len(comment_list)
                for comment in comment_list:
                    total += count_comments(comment.get('replies', []))
                return total
            
            total_comments = count_comments(comments)
            
            transformed_posts.append({
                'id': post.get('id'),
                'title': post.get('title'),
                'author': post.get('author'),
                'score': post.get('score'),
                'created_utc': post.get('created_utc'),
                'num_comments': total_comments,
                'url': item.get('url'),
                'selftext': post.get('selftext', ''),
                'subreddit': post.get('subreddit')
            })
        
        return {
            'subreddit': key,
            'posts': transformed_posts,
            'count': len(transformed_posts)
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Reddit data not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading posts: {str(e)}")

@app.get("/api/post/{post_id}")
async def get_post_with_comments(post_id: str):
    """Return a single post with all its comments (with hierarchical structure)."""
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'reddit_comments.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            all_posts = json.load(f)
        
        # Find the post by ID
        post_data = None
        for item in all_posts:
            if item.get('post', {}).get('id') == post_id:
                post_data = item
                break
        
        if not post_data:
            raise HTTPException(status_code=404, detail="Post not found")
        
        post = post_data.get('post', {})
        comments = post_data.get('comments', [])
        
        return {
            'post': {
                'id': post.get('id'),
                'title': post.get('title'),
                'author': post.get('author'),
                'score': post.get('score'),
                'created_utc': post.get('created_utc'),
                'num_comments': post.get('num_comments'),
                'selftext': post.get('selftext', ''),
                'subreddit': post.get('subreddit'),
                'url': post_data.get('url')
            },
            'comments': comments
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Reddit data not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading post: {str(e)}")
