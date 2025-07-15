'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果用户未登录且加载完成，重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=' + pathname);
    }
    
    if (user) {
      setLoading(false);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">个人中心</h1>
      
      {/* 导航标签 - 统一样式 */}
      <div className="flex justify-center border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <Link 
            href="/profile" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile') && !isActive('/profile/posts') && !isActive('/profile/bookmarks') && 
              !isActive('/profile/likes') && !isActive('/profile/comments') && !isActive('/profile/messages')
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的资料
          </Link>
          <Link 
            href="/profile/posts" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile/posts') 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的文章
          </Link>
          <Link 
            href="/profile/bookmarks" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile/bookmarks') 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的收藏
          </Link>
          <Link 
            href="/profile/likes" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile/likes') 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的点赞
          </Link>
          <Link 
            href="/profile/comments" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile/comments') 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的评论
          </Link>
          <Link 
            href="/profile/messages" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              isActive('/profile/messages') 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的消息
          </Link>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
} 