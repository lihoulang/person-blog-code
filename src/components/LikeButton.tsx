'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postId: string;
  className?: string;
  showCount?: boolean;
}

export default function LikeButton({ postId, className = '', showCount = true }: LikeButtonProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 检查文章点赞状态
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes?postId=${postId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setLikesCount(data.likesCount || 0);
          setIsLiked(data.userLiked || false);
        }
      } catch (error) {
        console.error('检查点赞状态失败:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    if (!isLoading) {
      checkLikeStatus();
    }
  }, [postId, isLoading]);

  // 切换点赞状态
  const toggleLike = async () => {
    if (!user) {
      // 如果用户未登录，重定向到登录页面
      toast.info('请先登录后再点赞');
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const action = isLiked ? 'unlike' : 'like';
      
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, action }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setIsLiked(data.userLiked);
        
        if (data.userLiked) {
          toast.success('感谢您的点赞！');
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || '操作失败');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败，请重试');
      console.error('点赞操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 如果正在检查点赞状态，显示加载中
  if (checkingStatus) {
    return (
      <button 
        className={`flex items-center justify-center opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {showCount && <span className="ml-1 animate-pulse">...</span>}
      </button>
    );
  }

  return (
    <button 
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center justify-center transition-colors ${
        loading ? 'opacity-50 cursor-not-allowed' : isLiked ? 'text-red-600' : 'hover:text-red-600'
      } ${className}`}
      aria-label={isLiked ? '取消点赞' : '点赞'}
      title={isLiked ? '取消点赞' : '点赞'}
    >
      {isLiked ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      {showCount && <span className="ml-1">{likesCount}</span>}
    </button>
  );
} 