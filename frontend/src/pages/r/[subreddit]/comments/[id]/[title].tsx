import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Flame, ChevronDown } from 'lucide-react'

export default function ThreadPage() {
  const router = useRouter()
  const { subreddit, id, title } = router.query
  const sub = useMemo(() => (typeof subreddit === 'string' ? subreddit.toLowerCase() : ''), [subreddit])
  const postTitle = typeof title === 'string' ? decodeURIComponent(title) : ''

  // Mock content/comments (can be wired later)
  const comments = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    author: `u-commenter${i + 1}`,
    body:
      i % 2 === 0
        ? 'This is a thoughtful take. I think OP raises valid points about trade-offs.'
        : 'Counterpoint: the premise is flawed. Consider alternative data from last year.',
    score: 120 - i * 7,
    age: `${i + 1}h`
  }))

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>{postTitle ? `${postTitle} • r/${sub}` : `r/${sub}`}</title>
      </Head>

      {/* Top navbar (continuity) */}
      <div className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <Link href={`/`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-full" />
          </Link>
          <div className="hidden md:flex items-center flex-1">
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 border border-gray-200">
                <span className="text-gray-500 text-sm">r/{sub}</span>
                <input placeholder="Search in thread" className="bg-transparent outline-none text-sm flex-1" />
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-semibold hover:bg-gray-50">Log In</button>
          </div>
        </div>
      </div>

      {/* Header strip with breadcrumb */}
      <div className="border-b border-gray-200 pt-14">
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-600 flex items-center gap-1">
          <Link href={`/r/${sub}`} className="font-semibold text-gray-800 hover:text-[#FF4500]">r/{sub}</Link>
          <span>/</span>
          <span className="opacity-80">comments</span>
          <span>/</span>
          <span className="opacity-80 truncate max-w-[40vw]">{postTitle || id}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post card */}
          <article className="relative rounded-lg border border-gray-200 bg-white">
            <div className="flex">
              {/* Vote bar */}
              <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-gray-100">
                <button aria-label="upvote" className="p-1 rounded hover:bg-gray-100"><ArrowBigUp className="w-5 h-5" /></button>
                <div className="text-xs font-semibold">4.6k</div>
                <button aria-label="downvote" className="p-1 rounded hover:bg-gray-100"><ArrowBigDown className="w-5 h-5" /></button>
              </div>
              {/* Content */}
              <div className="flex-1 p-4">
                <Link href="/dashboard" className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FF4500] text-white text-sm font-semibold hover:bg-[#ff5722]">
                  Analyze
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <span className="font-medium">u/exampleOP</span>
                  <span>•</span>
                  <span>18 days ago</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Discussion</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold mb-2">{postTitle || 'Thread title here'}</h1>
                <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                  <p>
                    This is placeholder body text for the thread. Replace with the real post content when wired to your data.
                    The layout mirrors Reddit: meta row, title, body, then action buttons.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs mt-3">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><MessageSquare className="w-4 h-4" /> 2.4k Comments</button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><Share2 className="w-4 h-4" /> Share</button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><Bookmark className="w-4 h-4" /> Save</button>
                </div>
              </div>
            </div>
          </article>

          {/* Sort comments */}
          <div className="flex items-center gap-2 text-sm py-1">
            <span className="text-gray-600">Sort by</span>
            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-medium">
              <Flame className="w-4 h-4 text-[#FF4500]" /> Best <ChevronDown className="w-4 h-4 opacity-60" />
            </button>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                  <span className="font-medium">{c.author}</span>
                  <span>•</span>
                  <span>{c.age} ago</span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{c.body}</p>
                <div className="flex items-center gap-2 text-xs">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><ArrowBigUp className="w-4 h-4" /> {c.score}</button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><ArrowBigDown className="w-4 h-4" /></button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><MessageSquare className="w-4 h-4" /> Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4 drop-shadow-md">
            <div className="text-sm font-semibold mb-2">About r/{sub}</div>
            <div className="text-xs text-gray-600">Single thread view with comments. Styled to match the subreddit page.</div>
          </div>
        </aside>
      </div>
    </main>
  )
}
