import Link from 'next/link'
import { getLatestPosts, getAllTags } from '@/lib/blog'

// 强制此页面在每次请求时重新渲染
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 获取最新文章
  const latestPosts = await getLatestPosts(5);
  // 获取所有标签
  const tags = await getAllTags();
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">欢迎来到我的个人博客</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md md:col-span-2">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">最新文章</h2>
            {latestPosts.length > 0 ? (
              <ul className="space-y-4">
                {latestPosts.map(post => (
                  <li key={post.slug} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline font-medium">
                      {post.title}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">{post.description || '阅读这篇精彩的文章'}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.author}</span>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.tags.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">暂无文章，敬请期待！</p>
            )}
            
            <div className="mt-4 text-right">
              <Link href="/blog" className="text-blue-600 hover:underline text-sm">
                查看全部文章 →
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 sm:mb-4">标签</h2>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Link 
                      key={tag.name} 
                      href={`/tags/${encodeURIComponent(tag.name)}`} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {tag.name} ({tag.count})
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无标签</p>
              )}
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">关于我</h2>
              <p className="text-gray-600 mb-3">我是一名热爱技术的开发者，喜欢分享编程知识和经验。</p>
              <Link href="/about" className="text-blue-600 hover:underline text-sm">
                了解更多 →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2">订阅更新</h2>
          <p className="text-gray-600 mb-4">获取最新文章和更新通知</p>
          <div className="flex justify-center space-x-4">
            <Link href="/rss.xml" target="_blank" className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z"></path>
                <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z"></path>
                <path d="M3 15a2 2 0 114 0 2 2 0 01-4 0z"></path>
              </svg>
              RSS
            </Link>
            <Link href="/atom.xml" target="_blank" className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              Atom
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 