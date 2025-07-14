'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface PostActionsProps {
  postId: number | string;
}

export default function PostActions({ postId }: PostActionsProps) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // 确保postId是数字
  const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;

  // 初始化时加载点赞和收藏状态
  useEffect(() => {
    // 检查postId是否有效
    if (isNaN(numericPostId)) {
      console.error('无效的postId:', postId);
      return;
    }
    
    const checkUserAuthStatus = async () => {
      try {
        // 检查是否已登录
        const response = await fetch('/api/auth/me');
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error('检查登录状态错误:', error);
        setIsAuthenticated(false);
      }
    };

    const fetchLikesData = async () => {
      try {
        const response = await fetch(`/api/likes?postId=${numericPostId}`);
        if (response.ok) {
          const data = await response.json();
          setLikesCount(data.likesCount || 0);
          setIsLiked(data.userLiked || false);
        }
      } catch (error) {
        console.error('获取点赞数据错误:', error);
      }
    };

    const fetchBookmarkStatus = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch(`/api/bookmarks?postId=${numericPostId}`);
          if (response.ok) {
            const data = await response.json();
            setIsBookmarked(data.isBookmarked || false);
          }
        } catch (error) {
          console.error('获取收藏状态错误:', error);
        }
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await checkUserAuthStatus();
      await fetchLikesData();
      await fetchBookmarkStatus();
      setIsLoading(false);
    };

    loadData();
  }, [postId, numericPostId, isAuthenticated]);

  // 处理点赞/取消点赞
  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      toast.info('请先登录后再点赞');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: numericPostId, action }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setIsLiked(data.userLiked);
        
        if (data.userLiked) {
          toast.success('感谢您的点赞！');
        }
      }
    } catch (error) {
      console.error('处理点赞请求错误:', error);
      toast.error('点赞操作失败，请稍后重试');
    }
  };

  // 处理收藏/取消收藏
  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      toast.info('请先登录后再收藏');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      if (isBookmarked) {
        // 取消收藏
        const response = await fetch(`/api/bookmarks?postId=${numericPostId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsBookmarked(false);
          toast.success('已从收藏中移除');
        }
      } else {
        // 添加收藏
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: numericPostId }),
        });

        if (response.ok) {
          setIsBookmarked(true);
          toast.success('文章已添加到收藏');
        }
      }
    } catch (error) {
      console.error('处理收藏请求错误:', error);
      toast.error('收藏操作失败，请稍后重试');
    }
  };

  if (isLoading) {
    return <div className="flex space-x-4 items-center mt-6 animate-pulse">
      <div className="h-10 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-10 w-20 bg-gray-200 rounded-full"></div>
    </div>;
  }

  return (
    <div className="flex space-x-4 items-center mt-6">
      {/* 点赞按钮 */}
      <button
        onClick={handleLikeClick}
        className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-colors ${
          isLiked
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
        aria-label={isLiked ? '取消点赞' : '点赞'}
      >
        <svg
          className={`h-5 w-5 ${isLiked ? 'text-red-600 fill-red-600' : 'text-gray-600'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>{likesCount}</span>
      </button>

      {/* 收藏按钮 */}
      <button
        onClick={handleBookmarkClick}
        className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-colors ${
          isBookmarked
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
        aria-label={isBookmarked ? '取消收藏' : '收藏'}
      >
        <svg
          className={`h-5 w-5 ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>{isBookmarked ? '已收藏' : '收藏'}</span>
      </button>
    </div>
  );
} 