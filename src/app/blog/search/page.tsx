'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/types/post'
import { getAllTags } from '@/lib/blog'

// 搜索结果组件
function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const sortBy = searchParams.get('sortBy') || 'relevance'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const author = searchParams.get('author') || ''
  const readTime = searchParams.get('readTime') || ''
  const minComments = searchParams.get('minComments') || ''
  
  const [results, setResults] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tags, setTags] = useState<{name: string, count: number}[]>([])
  const [authors, setAuthors] = useState<{name: string, count: number}[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // 获取所有标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTags = await getAllTags()
        setTags(allTags)
        
        // 获取所有作者
        const posts = await fetch('/api/blog/posts').then(res => res.json())
        const authorsMap = new Map()
        
        posts.forEach((post: any) => {
          if (post.author && post.author.name) {
            const name = post.author.name
            if (authorsMap.has(name)) {
              authorsMap.set(name, authorsMap.get(name) + 1)
            } else {
              authorsMap.set(name, 1)
            }
          }
        })
        
        const authorsList = Array.from(authorsMap.entries()).map(([name, count]) => ({
          name,
          count
        }))
        
        setAuthors(authorsList)
      } catch (err) {
        console.error('获取标签和作者失败:', err)
      }
    }
    
    fetchTags()
  }, [])
  
  // 执行搜索
  useEffect(() => {
    const search = async () => {
      if (!query && !tag && !dateFrom && !dateTo && !author && !readTime && !minComments) {
        setResults([])
        return
      }
      
      setIsLoading(true)
      setError('')
      
      try {
        // 构建搜索URL
        const searchUrl = new URL('/api/blog/search', window.location.origin)
        if (query) searchUrl.searchParams.append('q', query)
        if (tag) searchUrl.searchParams.append('tag', tag)
        if (dateFrom) searchUrl.searchParams.append('dateFrom', dateFrom)
        if (dateTo) searchUrl.searchParams.append('dateTo', dateTo)
        if (sortBy) searchUrl.searchParams.append('sortBy', sortBy)
        if (sortOrder) searchUrl.searchParams.append('sortOrder', sortOrder)
        if (author) searchUrl.searchParams.append('author', author)
        if (readTime) searchUrl.searchParams.append('readTime', readTime)
        if (minComments) searchUrl.searchParams.append('minComments', minComments)
        
        const response = await fetch(searchUrl)
        
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
  }, [query, tag, dateFrom, dateTo, sortBy, sortOrder, author, readTime, minComments])
  
  // 更新搜索参数
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    
    router.push(`/blog/search?${newParams.toString()}`)
  }
  
  // 处理排序变化
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const [newSortBy, newSortOrder] = value.split('-')
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder })
  }
  
  // 处理标签选择
  const handleTagSelect = (selectedTag: string) => {
    updateSearchParams({ tag: tag === selectedTag ? '' : selectedTag })
  }
  
  // 处理日期范围变化
  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    updateSearchParams({ [field]: value })
  }
  
  // 处理阅读时间选择
  const handleReadTimeSelect = (selectedReadTime: string) => {
    updateSearchParams({ readTime: readTime === selectedReadTime ? '' : selectedReadTime })
  }
  
  // 处理作者选择
  const handleAuthorSelect = (selectedAuthor: string) => {
    updateSearchParams({ author: author === selectedAuthor ? '' : selectedAuthor })
  }
  
  // 处理最少评论数变化
  const handleMinCommentsChange = (value: string) => {
    updateSearchParams({ minComments: value })
  }
  
  // 重置过滤器
  const resetFilters = () => {
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    router.push(`/blog/search?${newParams.toString()}`)
  }
  
  // 获取当前时间，精确到秒
  const currentTime = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回博客
        </Link>
        <h1 className="text-3xl font-bold mt-4">搜索结果: {query}</h1>
        <p className="text-sm text-gray-500 mt-1">
          搜索时间: {new Date().toLocaleDateString('zh-CN')} {currentTime}
        </p>
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
      
      {/* 过滤器切换按钮 */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? '隐藏过滤选项' : '显示过滤选项'}
        </button>
        
        {/* 排序选择器 */}
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm text-gray-600">排序:</label>
          <select
            id="sort"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="relevance-desc">相关度</option>
            <option value="date-desc">最新发布</option>
            <option value="date-asc">最早发布</option>
            <option value="views-desc">阅读最多</option>
            <option value="views-asc">阅读最少</option>
            <option value="comments-desc">评论最多</option>
            <option value="comments-asc">评论最少</option>
          </select>
        </div>
      </div>
      
      {/* 过滤选项 */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">过滤选项</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              重置过滤器
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 日期范围选择 */}
            <div>
              <h4 className="text-sm font-medium mb-2">日期范围</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="dateFrom" className="block text-xs text-gray-500 mb-1">开始日期</label>
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                    className="w-full border rounded-md px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dateTo" className="block text-xs text-gray-500 mb-1">结束日期</label>
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => handleDateChange('dateTo', e.target.value)}
                    className="w-full border rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* 标签选择 */}
            <div>
              <h4 className="text-sm font-medium mb-2">标签</h4>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {tags.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleTagSelect(t.name)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      tag === t.name
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    } border hover:bg-blue-50`}
                  >
                    {t.name} ({t.count})
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-gray-500">加载标签中...</span>
                )}
              </div>
            </div>
            
            {/* 新增：作者选择 */}
            <div>
              <h4 className="text-sm font-medium mb-2">作者</h4>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {authors.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => handleAuthorSelect(a.name)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      author === a.name
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    } border hover:bg-blue-50`}
                  >
                    {a.name} ({a.count})
                  </button>
                ))}
                {authors.length === 0 && (
                  <span className="text-xs text-gray-500">加载作者中...</span>
                )}
              </div>
            </div>
            
            {/* 新增：阅读时间选择 */}
            <div>
              <h4 className="text-sm font-medium mb-2">阅读时间</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleReadTimeSelect('short')}
                  className={`text-xs px-2 py-1 rounded-full ${
                    readTime === 'short'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border hover:bg-blue-50`}
                >
                  短文 (&lt;5分钟)
                </button>
                <button
                  onClick={() => handleReadTimeSelect('medium')}
                  className={`text-xs px-2 py-1 rounded-full ${
                    readTime === 'medium'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border hover:bg-blue-50`}
                >
                  中等 (5-15分钟)
                </button>
                <button
                  onClick={() => handleReadTimeSelect('long')}
                  className={`text-xs px-2 py-1 rounded-full ${
                    readTime === 'long'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border hover:bg-blue-50`}
                >
                  长文 (&gt;15分钟)
                </button>
              </div>
            </div>
            
            {/* 新增：最少评论数 */}
            <div>
              <h4 className="text-sm font-medium mb-2">最少评论数</h4>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  value={minComments}
                  onChange={(e) => handleMinCommentsChange(e.target.value)}
                  className="w-20 border rounded-md px-2 py-1 text-sm"
                  placeholder="0"
                />
                <span className="ml-2 text-xs text-gray-500">条评论以上</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                    <div className="text-gray-500 text-sm mb-3">
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                      {post.viewCount !== undefined && (
                        <span className="ml-4">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.viewCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">{post.description}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagSelect(tag)}
                            className={`bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded hover:bg-gray-200 ${
                              tag === searchParams.get('tag') ? 'bg-blue-100 text-blue-700' : ''
                            }`}
                          >
                            {tag}
                          </button>
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
            (query || tag || dateFrom || dateTo || author || readTime || minComments) && (
              <div className="text-center py-8">
                <p className="text-gray-500">没有找到匹配的结果</p>
                <p className="mt-2 text-gray-500">尝试使用不同的关键词或<Link href="/blog" className="text-blue-600 hover:underline">查看所有文章</Link></p>
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