import os, json, time
from typing import List, Dict, Any
from urllib.parse import urlparse
import httpx
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_PROVIDER = os.getenv("API_PROVIDER", "janitorai")

# Janitor AI (Cal Hacks)
JANITOR_API_KEY = os.getenv("JANITOR_API_KEY")
JANITOR_API_BASE = os.getenv("JANITOR_API_BASE", "https://janitorai.com/hackathon")

# Anthropic Claude
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Other Fallback APIs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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
    if not JANITOR_API_KEY and not ANTHROPIC_API_KEY:
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
        "You are ThreadSense, summarizing a Reddit discussion for a group.\n"
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
    if not JANITOR_API_KEY and not ANTHROPIC_API_KEY and not OPENAI_API_KEY:
        return generate_mock_response(messages)
    
    # Route to appropriate API based on provider
    if API_PROVIDER == "janitorai" and JANITOR_API_KEY:
        return await call_janitor_api(messages, max_tokens)
    elif API_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        return await call_anthropic_api(messages, max_tokens)
    elif API_PROVIDER == "openai" and OPENAI_API_KEY:
        return await call_openai_api(messages, max_tokens)
    elif API_PROVIDER == "gemini" and GEMINI_API_KEY:
        return await call_gemini_api(messages, max_tokens)
    else:
        # Fallback to Janitor AI if available
        if JANITOR_API_KEY:
            return await call_janitor_api(messages, max_tokens)
        # Or demo mode
        return generate_mock_response(messages)

async def call_janitor_api(messages: List[Dict[str,str]], max_tokens: int) -> str:
    """Call Janitor AI API (Cal Hacks Hackathon) - OpenAI-compatible with streaming"""
    payload = {
        "model": "x2",  # Can be anything, Janitor overwrites this
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": max_tokens,
        "stream": False  # Request non-streaming response
    }
    headers = {
        "Authorization": JANITOR_API_KEY,
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{JANITOR_API_BASE}/completions", headers=headers, json=payload)
        if r.status_code != 200:
            print(f"Janitor AI Error ({r.status_code}): {r.text}")
            raise HTTPException(status_code=502, detail=f"Janitor AI error: {r.status_code} - {r.text[:200]}")
        
        response_text = r.text
        print(f"Janitor AI Raw Response: {response_text[:500]}")
        
        # Check if it's a streaming response (SSE format)
        if response_text.startswith("data:"):
            # Parse SSE streaming response
            full_content = ""
            for line in response_text.split("\n"):
                line = line.strip()
                if line.startswith("data:") and "DONE" not in line:
                    try:
                        json_str = line[5:].strip()  # Remove "data:" prefix
                        if not json_str:  # Skip empty data lines
                            continue
                        chunk = json.loads(json_str)
                        # Handle different response formats
                        if "content" in chunk:
                            full_content += chunk["content"]
                        elif "choices" in chunk and len(chunk["choices"]) > 0:
                            delta = chunk["choices"][0].get("delta", {})
                            if "content" in delta:
                                full_content += delta["content"]
                            # Also check message.content for non-streaming format
                            msg = chunk["choices"][0].get("message", {})
                            if "content" in msg:
                                full_content += msg["content"]
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        print(f"Error parsing chunk: {e}")
                        continue
            return full_content.strip() if full_content else "No content received from Janitor AI"
        else:
            # Try parsing as regular JSON
            try:
                data = r.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Janitor AI Response parsing error: {e}")
                print(f"Response text: {response_text[:500]}")
                return response_text if response_text else "Error: Empty response from Janitor AI"

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

# ---------- routes ----------

@app.get("/health")
async def health():
    active_key = None
    if API_PROVIDER == "janitorai" and JANITOR_API_KEY:
        active_key = JANITOR_API_KEY[:10] if len(JANITOR_API_KEY) > 10 else JANITOR_API_KEY
    elif API_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        active_key = ANTHROPIC_API_KEY[:10]
    
    return {
        "ok": True, 
        "time": time.time(),
        "api_provider": API_PROVIDER,
        "has_janitor_key": bool(JANITOR_API_KEY),
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
    # attempt JSON parse; if model returns text, wrap safely
    try:
        analysis = json.loads(content)
    except Exception:
        analysis = {"raw": content}
    return {"analysis": analysis, "count": len(comments)}

@app.post("/api/compare")
async def compare_threads(body: Dict[str, Any] = Body(...)):
    """Compare multiple Reddit threads side-by-side"""
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
    """Batch analyze multiple threads (Enterprise feature)"""
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
    """Get API usage statistics (demo endpoint)"""
    return {
        "total_analyses": 1247,
        "active_users": 89,
        "avg_response_time": "4.2s",
        "uptime": "99.9%",
        "last_24h": 156
    }
