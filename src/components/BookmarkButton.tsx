'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
  postId: string;
  className?: string;
}

export default function BookmarkButton({ postId, className = '' }: BookmarkButtonProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 检查文章是否已收藏
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch('/api/user/bookmarks', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const bookmark = data.bookmarks.find((b: any) => b.postId === postId);
          
          if (bookmark) {
            setIsBookmarked(true);
            setBookmarkId(bookmark.id);
          }
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    if (!isLoading) {
      checkBookmarkStatus();
    }
  }, [user, postId, isLoading]);

  // 切换收藏状态
  const toggleBookmark = async () => {
    if (!user) {
      // 如果用户未登录，重定向到登录页面
      toast.info('请先登录后再收藏');
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isBookmarked && bookmarkId) {
        // 删除收藏
        const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsBookmarked(false);
          setBookmarkId(null);
          toast.success('已取消收藏');
        } else {
          const data = await response.json();
          throw new Error(data.error || '取消收藏失败');
        }
      } else {
        // 添加收藏
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(true);
          setBookmarkId(data.bookmark.id);
          toast.success('收藏成功');
        } else {
          const data = await response.json();
          throw new Error(data.error || '收藏失败');
        }
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败，请重试');
      console.error('收藏操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 如果正在检查收藏状态，显示加载中
  if (checkingStatus) {
    return (
      <button 
        className={`flex items-center justify-center opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    );
  }

  return (
    <button 
      onClick={toggleBookmark}
      disabled={loading}
      className={`flex items-center justify-center transition-colors ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'
      } ${className}`}
      aria-label={isBookmarked ? '取消收藏' : '收藏文章'}
      title={isBookmarked ? '取消收藏' : '收藏文章'}
    >
      {isBookmarked ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
} 