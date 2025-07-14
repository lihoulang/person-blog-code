'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/blog'

// 搜索结果组件
function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      
      setIsLoading(true)
      setError('')
      
      try {
        const response = await fetch(`/api/blog/search?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('搜索失败')
        }
        
        const data = await response.json()
        setResults(data.results)
      } catch (err) {
        setError('搜索时出错，请稍后再试')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    search()
  }, [query])
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回博客
        </Link>
        <h1 className="text-3xl font-bold mt-4">搜索结果: {query}</h1>
      </div>
      
      {/* 搜索表单 */}
      <form action="/blog/search" className="mb-8">
        <div className="flex">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="搜索文章..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700"
          >
            搜索
          </button>
        </div>
      </form>
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在搜索...</p>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* 搜索结果 */}
      {!isLoading && !error && (
        <>
          {results.length > 0 ? (
            <div className="space-y-8">
              <p className="text-gray-600">找到 {results.length} 条结果</p>
              
              {results.map(post => (
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
                        {post.tags.map(tag => (
                          <Link
                            key={tag}
                            href={`/blog/tags/${encodeURIComponent(tag)}`}
                            className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded hover:bg-gray-200"
                          >
                            {tag}
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
              ))}
            </div>
          ) : (
            query && (
              <div className="text-center py-8">
                <p className="text-gray-500">没有找到匹配的结果</p>
                <p className="mt-2 text-gray-500">尝试使用不同的关键词或查看<Link href="/blog" className="text-blue-600 hover:underline">所有文章</Link></p>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

// 主页面组件
export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Suspense fallback={
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
} 