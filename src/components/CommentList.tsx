'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Comment } from '@/types/comment'
import CommentForm from './CommentForm'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface CommentListProps {
  slug: string
}

export default function CommentList({ slug }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // 加载评论
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/comments?slug=${slug}&hierarchy=true`)
      
      if (!response.ok) {
        throw new Error('获取评论失败')
      }
      
      const data = await response.json()
      setComments(data)
    } catch (err) {
      setError('加载评论失败')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  // 初始加载评论
  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // 渲染评论时间
  const renderCommentTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN,
      })
    } catch (error) {
      return '未知时间'
    }
  }

  // 渲染单个评论
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`bg-white p-4 rounded-lg shadow-sm mb-4 ${isReply ? 'ml-8' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{comment.name}</h4>
          <p className="text-xs text-gray-500">
            {renderCommentTime(comment.createdAt)}
          </p>
        </div>
        
        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="text-sm text-blue-600 hover:underline"
        >
          {replyingTo === comment.id ? '取消' : '回复'}
        </button>
      </div>
      
      <div className="mt-2 text-gray-700">
        <p>{comment.content}</p>
      </div>
      
      {/* 回复表单 */}
      {replyingTo === comment.id && (
        <div className="mt-4">
          <CommentForm
            slug={slug}
            parentId={comment.id}
            onSuccess={() => {
              setReplyingTo(null)
              fetchComments()
            }}
            onCancel={() => setReplyingTo(null)}
          />
        </div>
      )}
      
      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-gray-100">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      
      {/* 评论表单 */}
      <CommentForm slug={slug} onSuccess={fetchComments} />
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载评论中...</p>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* 评论列表 */}
      {!isLoading && !error && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">{comments.length} 条评论</p>
          </div>
          
          {comments.length > 0 ? (
            <div>
              {comments.map((comment) => renderComment(comment))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">暂无评论，来发表第一条评论吧！</p>
            </div>
          )}
        </>
      )}
    </div>
  )
} 