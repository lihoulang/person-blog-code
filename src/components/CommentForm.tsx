'use client'

import React, { useState, FormEvent } from 'react'

interface CommentFormProps {
  slug: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CommentForm({ slug, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!name || !content) {
      setError('名称和评论内容是必需的')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          name,
          email: email || undefined,
          content,
          parentId: parentId || undefined,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '提交评论失败')
      }
      
      // 重置表单
      setName('')
      setEmail('')
      setContent('')
      
      // 通知父组件评论提交成功
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交评论失败')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {parentId ? '回复评论' : '发表评论'}
      </h3>
      
      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名称 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              电子邮件 (可选)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            评论内容 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              取消
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交评论'}
          </button>
        </div>
      </form>
    </div>
  )
} 