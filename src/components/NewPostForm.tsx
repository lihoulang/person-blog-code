'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Editor from './Editor'

export default function NewPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (postData: {
    title: string
    description: string
    content: string
    tags: string[]
  }) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/mdx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建文章失败')
      }

      await response.json()
      
      // 重定向到文章列表页面
      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建文章时出错')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <Editor
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
} 