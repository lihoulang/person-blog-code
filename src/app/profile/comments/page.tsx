'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

// 评论类型定义
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  isApproved: boolean;
}

export default function CommentsPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // 加载用户评论
  useEffect(() => {
    if (user) {
      fetchUserComments();
    }
  }, [user]);

  // 获取用户评论
  const fetchUserComments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/comments', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('获取评论失败');
      }
      
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('获取评论失败:', error);
      toast.error('获取评论失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const deleteComment = async (commentId: string) => {
    try {
      setDeleting(commentId);
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('删除评论失败');
      }
      
      // 从列表中移除已删除的评论
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      toast.error('删除评论失败，请重试');
    } finally {
      setDeleting(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">我的评论</h2>
        <p className="text-gray-500 text-sm mt-1">管理您发表的所有评论</p>
      </div>
      
      <div className="p-6">
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    href={`/blog/${comment.postSlug}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {comment.postTitle}
                  </Link>
                  <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{comment.content}</p>
                
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    comment.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comment.isApproved ? '已审核' : '待审核'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/blog/${comment.postSlug}#comment-${comment.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      查看
                    </Link>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={deleting === comment.id}
                      className={`text-sm text-red-600 hover:underline ${
                        deleting === comment.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deleting === comment.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>您还没有发表任何评论</p>
            <Link 
              href="/blog"
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              浏览文章并发表评论
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 