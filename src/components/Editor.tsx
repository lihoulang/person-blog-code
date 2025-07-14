'use client'

import { useState, ChangeEvent, FormEvent } from 'react'

interface EditorProps {
  initialData?: {
    title: string
    description: string
    content: string
    tags: string[]
  }
  onSubmit: (_data: {
    title: string
    description: string
    content: string
    tags: string[]
  }) => void
  isSubmitting: boolean
}

export default function Editor({ initialData, onSubmit, isSubmitting }: EditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '')
  const [preview, setPreview] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // 处理标签
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
    
    onSubmit({
      title,
      description,
      content,
      tags,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          标题 *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          标签 (用逗号分隔)
        </label>
        <input
          type="text"
          id="tags"
          value={tagsInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTagsInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="技术, 博客, React"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            内容 *
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-sm text-blue-600 hover:underline"
          >
            {preview ? '编辑' : '预览'}
          </button>
        </div>
        
        {!preview ? (
          <textarea
            id="content"
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={15}
            required
          />
        ) : (
          <div className="w-full p-4 border border-gray-300 rounded-md prose max-w-none min-h-[300px] bg-white overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          支持 Markdown 语法
        </p>
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
        >
          {isSubmitting ? '提交中...' : (initialData ? '更新文章' : '发布文章')}
        </button>
        
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          取消
        </button>
      </div>
    </form>
  )
} 