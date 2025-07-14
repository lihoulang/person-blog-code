'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
}

export default function AdminPostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/mdx')
        
        if (!response.ok) {
          throw new Error('获取文章失败')
        }
        
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError('获取文章列表失败')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPosts()
  }, [])

  const handleDelete = async (slug: string) => {
    if (!window.confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return
    }
    
    try {
      const response = await fetch(`/api/mdx/${slug}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除文章失败')
      }
      
      // 从列表中移除已删除的文章
      setPosts(posts.filter(post => post.slug !== slug))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除文章时出错')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无文章</p>
        <p className="mt-2">
          <Link href="/admin/posts/new" className="text-blue-600 hover:underline">
            创建第一篇文章
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              标题
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              日期
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              标签
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post.slug} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{post.title}</div>
                <div className="text-sm text-gray-500">{post.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{post.date}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {post.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-900"
                    target="_blank"
                  >
                    查看
                  </Link>
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 