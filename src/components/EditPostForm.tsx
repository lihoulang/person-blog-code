'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Editor from './Editor'

interface EditPostFormProps {
  slug: string
}

export default function EditPostForm({ slug }: EditPostFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [post, setPost] = useState<{
    title: string
    description: string
    content: string
    tags: string[]
  } | null>(null)
  
  const router = useRouter()

  // 加载文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/mdx/${slug}`)
        
        if (!response.ok) {
          throw new Error('获取文章失败')
        }
        
        const data = await response.json()
        setPost({
          title: data.title,
          description: data.description || '',
          content: data.content || '',
          tags: data.tags || [],
        })
      } catch (err) {
        setError('获取文章数据失败')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPost()
  }, [slug])

  // 处理提交
  const handleSubmit = async (postData: {
    title: string
    description: string
    content: string
    tags: string[]
  }) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/mdx/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新文章失败')
      }
      
      // 重定向到文章列表页面
      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新文章时出错')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (error && !post) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  if (!post) {
    return <div className="text-center py-8">找不到文章</div>
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <Editor
        initialData={post}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
} 