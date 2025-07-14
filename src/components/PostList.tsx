import { PostMetadata } from '@/lib/mdx'
import Link from 'next/link'

interface PostListProps {
  posts: PostMetadata[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        暂无文章
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {posts.map(post => (
        <article key={post.slug} className="border-b pb-8 last:border-none">
          <h2 className="text-2xl font-semibold mb-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition">
              {post.title}
            </Link>
          </h2>
          <div className="text-gray-500 text-sm mb-3">{post.formattedDate}</div>
          <p className="text-gray-700 mb-4">{post.description}</p>
          <div className="flex flex-wrap gap-2">
            {post.tags?.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
              阅读更多 →
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
} 