'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  userId: string | number;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function FollowButton({ 
  userId, 
  className = '', 
  showCount = true,
  size = 'md'
}: FollowButtonProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 确保userId是字符串
  const userIdString = typeof userId === 'number' ? userId.toString() : userId;

  // 检查关注状态
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/user/follow?userId=${userIdString}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing || false);
          setFollowersCount(data.followersCount || 0);
        }
      } catch (error) {
        console.error('检查关注状态失败:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    if (!isLoading) {
      checkFollowStatus();
    }
  }, [userIdString, isLoading]);

  // 切换关注状态
  const toggleFollow = async () => {
    if (!user) {
      // 如果用户未登录，重定向到登录页面
      toast.info('请先登录后再关注');
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const action = isFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch('/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userIdString, action }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        
        toast.success(data.message);
      } else {
        const data = await response.json();
        throw new Error(data.error || '操作失败');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败，请重试');
      console.error('关注操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据尺寸设置样式
  const buttonSizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  const sizeClass = buttonSizeClasses[size];

  // 如果正在检查关注状态，显示加载中
  if (checkingStatus) {
    return (
      <button 
        className={`inline-flex items-center justify-center ${sizeClass} font-medium rounded-md bg-gray-200 text-gray-400 cursor-not-allowed ${className}`}
        disabled
      >
        <span className="animate-pulse">加载中...</span>
      </button>
    );
  }

  return (
    <button 
      onClick={toggleFollow}
      disabled={loading}
      className={`inline-flex items-center justify-center ${sizeClass} font-medium rounded-md transition-colors ${
        isFollowing
          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          处理中
        </span>
      ) : (
        <>
          {isFollowing ? '已关注' : '关注'}
          {showCount && followersCount > 0 && (
            <span className="ml-1 text-xs">({followersCount})</span>
          )}
        </>
      )}
    </button>
  );
} 