'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { formatDate } from '@/lib/utils'

// 评论类型
interface Comment {
  id: number | string
  content: string
  createdAt: string
  author?: {
    id: number | string
    name: string
  }
  guestName?: string | null
  guestEmail?: string | null
  parentId?: number | string | null
  replies?: Comment[]
}

interface CommentsProps {
  postId: string
  postSlug?: string // 可选参数
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [replyTo, setReplyTo] = useState<string | number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const commentsPerPage = 10
  
  const { user } = useAuth()
  const commentsEndRef = useRef<HTMLDivElement>(null)
  
  // 加载评论
  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(`/api/comments?postId=${postId}&page=${pageNum}&limit=${commentsPerPage}`);
      if (!response.ok) throw new Error('加载评论失败');
      
      const data = await response.json();
      const newComments = data.comments || [];
      
      // 检查是否还有更多评论
      setHasMore(newComments.length === commentsPerPage);
      
      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      toast.error('加载评论失败，请稍后再试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId]);
  
  // 初始加载评论
  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);
  
  // 加载更多评论
  const loadMoreComments = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };
  
  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('评论内容不能为空');
      return;
    }
    
    // 游客评论验证
    if (!user) {
      if (!guestName.trim()) {
        toast.error('请输入您的名字');
        return;
      }
      
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        toast.error('请输入有效的邮箱地址');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      
      const commentData = {
        postId,
        content: content.trim(),
        parentId: replyTo,
        ...(user ? {} : { guestName, guestEmail }),
      };
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '提交评论失败');
      }
      
      const result = await response.json();
      
      // 如果评论已批准，立即添加到评论列表
      if (result.comment.isApproved) {
        if (replyTo) {
          // 如果是回复，找到父评论并添加回复
          setComments(prevComments => {
            return prevComments.map(comment => {
              if (comment.id === replyTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), result.comment]
                };
              }
              return comment;
            });
          });
        } else {
          // 如果是新评论，添加到列表顶部
          setComments(prevComments => [result.comment, ...prevComments]);
        }
      }
      
      // 清除表单
      setContent('');
      setReplyTo(null);
      
      toast.success(result.message || '评论已提交，等待审核');
    } catch (error) {
      console.error('提交评论失败:', error);
      toast.error(error instanceof Error ? error.message : '提交评论失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 取消回复
  const cancelReply = () => {
    setReplyTo(null);
  };
  
  // 设置回复
  const handleReply = (commentId: number | string) => {
    setReplyTo(commentId);
    // 滚动到评论框
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 渲染单个评论
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    return (
      <div 
        key={comment.id} 
        className={`${isReply ? 'ml-8 mt-4' : 'border-t border-gray-100 pt-6'} pb-6`}
        id={`comment-${comment.id}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {(comment.author?.name || comment.guestName || 'Anonymous').charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <span className="font-medium mr-2">
                {comment.author?.name || comment.guestName || '匿名用户'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt, 'YYYY-MM-DD HH:mm')}
              </span>
            </div>
            <div className="text-gray-800 whitespace-pre-line break-words mb-2">
              {comment.content}
            </div>
            <button
              onClick={() => handleReply(comment.id)}
              className="text-blue-600 text-sm hover:underline"
            >
              回复
            </button>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      
      {/* 评论列表 */}
      <div className="mb-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : comments.length > 0 ? (
          <>
            <div className="space-y-6">
              {comments.map(comment => renderComment(comment))}
            </div>
            
            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreComments}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      加载中...
                    </span>
                  ) : '加载更多评论'}
                </button>
              </div>
            )}
            
            {/* 评论底部标记 */}
            <div ref={commentsEndRef} />
          </>
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-lg border">
            <p className="text-gray-600">暂无评论，成为第一个评论的人吧！</p>
          </div>
        )}
      </div>
      
      {/* 评论表单 */}
      <div id="comment-form" className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-4">
          {replyTo ? '回复评论' : '发表评论'}
        </h3>
        
        {replyTo && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 flex justify-between items-center">
            <p className="text-sm text-blue-800">
              正在回复评论
            </p>
            <button 
              onClick={cancelReply} 
              className="text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* 游客信息（未登录时显示） */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  名字 *
                </label>
                <input
                  id="name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 * (不会公开)
                </label>
                <input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              评论内容 *
            </label>
            <textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交评论'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
} 