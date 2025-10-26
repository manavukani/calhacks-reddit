import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo, useEffect, useState } from 'react'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Flame, ChevronDown } from 'lucide-react'

const BACKEND = 'http://localhost:8000'

interface Comment {
  id: string
  author: string
  body: string
  score: number
  created_utc: number
  parent_id: string
  depth: number
  replies: Comment[]
}

interface Post {
  id: string
  title: string
  author: string
  score: number
  created_utc: number
  num_comments: number
  selftext: string
  subreddit: string
  url: string
}

function CommentTree({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const timeAgo = comment.created_utc
    ? (() => {
        const seconds = Math.floor(Date.now() / 1000 - comment.created_utc)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor(seconds / 60)
        if (days > 0) return `${days}d`
        if (hours > 0) return `${hours}h`
        if (minutes > 0) return `${minutes}m`
        return 'now'
      })()
    : '1h'

  return (
    <div className={depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-3' : ''}>
      <div className="rounded-lg border border-gray-200 bg-white p-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-semibold text-orange-600">
            {comment.author?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="font-medium">u/{comment.author}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{comment.body}</p>
        <div className="flex items-center gap-2 text-xs">
          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
            <ArrowBigUp className="w-4 h-4" /> {comment.score}
          </button>
          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
            <ArrowBigDown className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
            <MessageSquare className="w-4 h-4" /> Reply
          </button>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentTree key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ThreadPage() {
  const router = useRouter()
  const { subreddit, id, title } = router.query
  const sub = useMemo(() => (typeof subreddit === 'string' ? subreddit.toLowerCase() : ''), [subreddit])
  const postId = typeof id === 'string' ? id : ''
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    if (!postId) return
    let cancelled = false
    
    async function fetchPost() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${BACKEND}/api/post/${postId}`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!cancelled) {
          setPost(data.post)
          setComments(data.comments || [])
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load post')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    
    fetchPost()
    return () => { cancelled = true }
  }, [postId])

  const postTitle = post?.title || ''
  const timeAgo = post?.created_utc
    ? (() => {
        const seconds = Math.floor(Date.now() / 1000 - post.created_utc)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor(seconds / 3600)
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        return 'just now'
      })()
    : 'recently'
  
  const formattedScore = post?.score && post.score >= 1000
    ? `${(post.score / 1000).toFixed(1)}k`
    : post?.score || 0

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
          {loading ? (
            <article className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            </article>
          ) : error ? (
            <article className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </article>
          ) : post ? (
            <article className="relative rounded-lg border border-gray-200 bg-white">
              <div className="flex">
                {/* Vote bar */}
                <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-gray-100">
                  <button aria-label="upvote" className="p-1 rounded hover:bg-gray-100"><ArrowBigUp className="w-5 h-5" /></button>
                  <div className="text-xs font-semibold">{formattedScore}</div>
                  <button aria-label="downvote" className="p-1 rounded hover:bg-gray-100"><ArrowBigDown className="w-5 h-5" /></button>
                </div>
                {/* Content */}
                <div className="flex-1 p-4">
                  <Link href="/dashboard" className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FF4500] text-white text-sm font-semibold hover:bg-[#ff5722]">
                    Analyze
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-semibold text-orange-600">
                      {post.author?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">u/{post.author}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold mb-2">{post.title}</h1>
                  {post.selftext && (
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-800 mb-3">
                      <p className="whitespace-pre-wrap">{post.selftext}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs mt-3">
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><MessageSquare className="w-4 h-4" /> {comments.length} Comments</button>
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><Share2 className="w-4 h-4" /> Share</button>
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"><Bookmark className="w-4 h-4" /> Save</button>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {/* Sort comments */}
          <div className="flex items-center gap-2 text-sm py-1">
            <span className="text-gray-600">Sort by</span>
            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 font-medium">
              <Flame className="w-4 h-4 text-[#FF4500]" /> Best <ChevronDown className="w-4 h-4 opacity-60" />
            </button>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentTree key={comment.id} comment={comment} depth={0} />
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">No comments yet.</p>
              </div>
            )}
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
