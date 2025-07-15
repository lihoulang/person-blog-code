'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserPostsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const activeTab = 'posts';

  useEffect(() => {
    // 如果用户未登录且加载完成，重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    
    // 如果用户已登录，获取用户的文章
    if (user) {
      setLoading(false);
      // 这里应该获取用户的文章，但目前只是示例
      setPosts([]);
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">个人中心</h1>
      
      {/* 导航标签 */}
      <div className="flex justify-center border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <Link 
            href="/profile" 
            className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
          >
            我的资料
          </Link>
          <Link 
            href="/profile/posts" 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'posts' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            我的文章
          </Link>
          <Link 
            href="/profile/bookmarks" 
            className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
          >
            我的收藏
          </Link>
          <Link 
            href="/profile/likes" 
            className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
          >
            我的点赞
          </Link>
          <Link 
            href="/profile/comments" 
            className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors"
          >
            我的评论
          </Link>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">我的文章</h2>
          <Link 
            href="/posts/create" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            写新文章
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          {posts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {/* 这里应该渲染文章列表，但目前只是示例 */}
              <p>您还没有发布任何文章。</p>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">您还没有发布任何文章</p>
              <Link 
                href="/posts/create" 
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                写第一篇文章
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 