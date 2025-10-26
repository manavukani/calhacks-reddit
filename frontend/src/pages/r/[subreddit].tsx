import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, UserPlus, ChevronDown, Flame, Clock4, ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Target } from 'lucide-react'

const ALLOWED = new Set(['worldnews', 'askreddit', 'science', 'askhistorians'])
const BACKEND = 'http://localhost:8000'

export default function SubredditPage() {
  const router = useRouter()
  const { subreddit } = router.query
  const key = useMemo(() => (typeof subreddit === 'string' ? subreddit.toLowerCase() : ''), [subreddit])
  const allowed = useMemo(() => ALLOWED.has(key), [key])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState('')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    if (!key || !allowed) return
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        // Fetch summary
        const summaryRes = await fetch(`${BACKEND}/api/subreddit/${key}/summary`)
        if (!summaryRes.ok) throw new Error(await summaryRes.text())
        const summaryData = await summaryRes.json()
        if (!cancelled) setOverview(summaryData?.overview ?? '')

        // Fetch posts
        const postsRes = await fetch(`${BACKEND}/api/subreddit/${key}/posts`)
        if (!postsRes.ok) throw new Error(await postsRes.text())
        const postsData = await postsRes.json()
        if (!cancelled) setPosts(postsData?.posts ?? [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [key, allowed])

  if (!key) return null

  if (!allowed) {
    return (
      <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto bg-white text-gray-900">
        <Head>
          <title>r/{key} • MVP</title>
        </Head>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-3xl font-semibold">hey it&apos;s hackathon MVP</div>
          <p className="text-gray-600">not all urls work — try one of these:</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {Array.from(ALLOWED).map((s) => (
              <Link key={s} href={`/r/${s}`} className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition">
                r/{s}
              </Link>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>r/{key}</title>
      </Head>
      {/* Top navbar */}
      <div className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">Reddit:AI</span>
          </Link>
          <div className="hidden md:flex items-center flex-1">
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 border border-gray-200">
                <span className="text-gray-500 text-sm">/r/{key}</span>
                <input placeholder="Search in r/" className="bg-transparent outline-none text-sm flex-1" />
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-semibold hover:bg-gray-50">Log In</button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="border-b border-gray-200 pt-14">
        <div className="max-w-6xl mx-auto">
          <div className="h-28 md:h-32 w-full bg-[radial-gradient(circle_at_10%_20%,rgba(255,69,0,0.18),transparent_40%),_radial-gradient(circle_at_80%_30%,rgba(255,87,34,0.18),transparent_35%),_linear-gradient(0deg,#fff,#fff)]" />
          <div className="px-4 flex items-center gap-4 -mt-6 pb-4">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow -mt-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-orange-100" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">r/{key}</div>
              <div className="text-sm text-gray-600">Community • MVP clone vibe</div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold">
                <Plus className="w-4 h-4" /> Create Post
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#FF4500] text-white hover:bg-[#ff5722] text-sm font-semibold">
                <UserPlus className="w-4 h-4" /> Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-sm">
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-medium">
            <Flame className="w-4 h-4 text-[#FF4500]" /> Best <ChevronDown className="w-4 h-4 opacity-60" />
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-medium">
            <Clock4 className="w-4 h-4" /> New
          </button>
          <div className="ml-auto sm:hidden">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#FF4500] text-white hover:bg-[#ff5722] font-semibold">
              <Plus className="w-4 h-4" /> Post
            </button>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* What’s going on card */}
          <section
            className="relative rounded-xl bg-white p-5 drop-shadow-[0_10px_13px_rgba(255,69,0,0.06)] shadow-[0_20px_25px_-5px_rgba(255,69,0,0.1)] border border-gray-200"
          >
            <div className="text-lg font-semibold mb-2">What’s going on?</div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
                <div className="h-4 w-3/6 bg-gray-200 rounded" />
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <p className="text-sm leading-6 text-gray-700">{overview}</p>
            )}
          </section>

          {/* Posts list */}
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <article key={i} className="rounded-lg border border-gray-200 bg-white animate-pulse">
                  <div className="flex">
                    <div className="w-12 shrink-0 border-r border-gray-100 py-3" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                </article>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const timeAgo = post.created_utc 
                  ? (() => {
                      const seconds = Math.floor(Date.now() / 1000 - post.created_utc)
                      const days = Math.floor(seconds / 86400)
                      const hours = Math.floor(seconds / 3600)
                      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
                      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
                      return 'just now'
                    })()
                  : 'recently'
                
                const formattedScore = post.score >= 1000 
                  ? `${(post.score / 1000).toFixed(1)}k` 
                  : post.score

                // Create URL-friendly title slug
                const titleSlug = post.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_+|_+$/g, '')
                  .substring(0, 100)
                
                const threadUrl = `/r/${post.subreddit}/comments/${post.id}/${titleSlug}`

                return (
                  <article key={post.id} className="rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition">
                    <div className="flex">
                      {/* Vote bar */}
                      <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-gray-100">
                        <button aria-label="upvote" className="p-1 rounded hover:bg-gray-100">
                          <ArrowBigUp className="w-5 h-5" />
                        </button>
                        <div className="text-xs font-semibold">{formattedScore}</div>
                        <button aria-label="downvote" className="p-1 rounded hover:bg-gray-100">
                          <ArrowBigDown className="w-5 h-5" />
                        </button>
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-semibold text-orange-600">
                            {post.author?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium">u/{post.author}</span>
                          <span>•</span>
                          <span>{timeAgo}</span>
                        </div>
                        <Link href={threadUrl}>
                          <h3 className="text-base md:text-lg font-semibold mb-2 hover:text-[#FF4500] cursor-pointer">
                            {post.title}
                          </h3>
                        </Link>
                        {post.selftext && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.selftext}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
                            <MessageSquare className="w-4 h-4" /> {post.num_comments}
                          </button>
                          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
                            <Bookmark className="w-4 h-4" /> Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">No posts available for this subreddit yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4 drop-shadow-md">
            <div className="text-sm font-semibold mb-2">About community</div>
            <div className="text-xs text-gray-600">MVP for CalHacks. Reddit in 2025.</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Created</div>
                <div className="font-medium">Jan 25, 2008</div>
              </div>
              <div>
                <div className="text-gray-500">Members</div>
                <div className="font-medium">14M</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 drop-shadow-md">
            <div className="text-sm font-semibold mb-2">Quick links</div>
            <div className="flex flex-wrap gap-2">
              {Array.from(ALLOWED).map((s) => (
                <Link key={s} href={`/r/${s}`} className="text-xs px-2 py-1 rounded bg-orange-50 text-[#FF4500] hover:bg-orange-100 transition">
                  r/{s}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 drop-shadow-md">
            <div className="text-sm font-semibold mb-2">Community bookmarks</div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium">Wiki</button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium">Related Subreddits</button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium">Rules</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
