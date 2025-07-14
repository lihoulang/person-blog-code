import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getAllTags } from '@/lib/blog'
import TagCloud from '@/components/TagCloud'

interface TagPageProps {
  params: {
    tag: string
  }
}

// 动态生成页面标题
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = params
  const decodedTag = decodeURIComponent(tag)
  
  return {
    title: `${decodedTag} - 博客标签 - 个人博客`,
    description: `查看所有关于 ${decodedTag} 的博客文章`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = params
  const decodedTag = decodeURIComponent(tag)
  
  // 获取所有文章
  const allPosts = await getAllPosts()
  
  // 筛选当前标签的文章
  const posts = allPosts.filter(post => 
    post.tags.some((postTag: string) => postTag.toLowerCase() === decodedTag.toLowerCase())
  )
  
  // 获取所有标签用于标签云
  const allTags = await getAllTags()
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回所有文章
        </Link>
        <h1 className="text-3xl font-bold mt-4">标签: {decodedTag}</h1>
        <p className="text-gray-600 mt-2">找到 {posts.length} 篇相关文章</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* 文章列表 */}
        <div className="md:w-3/4">
          <div className="grid gap-8 md:grid-cols-2">
            {posts.length > 0 ? posts.map(post => (
              <article key={post.slug} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition">
                      {post.title}
                    </Link>
                  </h2>
                  <div className="text-gray-500 text-sm mb-3">{post.date}</div>
                  <p className="text-gray-700 mb-4">{post.description}</p>
                  
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((postTag: string) => (
                        <Link 
                          key={postTag} 
                          href={`/blog/tags/${encodeURIComponent(postTag)}`}
                          className={`px-2 py-1 text-xs rounded ${
                            postTag.toLowerCase() === decodedTag.toLowerCase()
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {postTag}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                      阅读更多 →
                    </Link>
                  </div>
                </div>
              </article>
            )) : (
              <div className="col-span-2 border rounded-lg overflow-hidden bg-gray-50 shadow-sm flex items-center justify-center p-12">
                <p className="text-gray-400 text-center">没有找到相关文章</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 侧边栏 */}
        <div className="md:w-1/4">
          <TagCloud tags={allTags} className="sticky top-4" />
        </div>
      </div>
    </div>
  )
} 