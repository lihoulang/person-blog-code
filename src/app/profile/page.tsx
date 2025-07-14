'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果用户未登录且加载完成，重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    
    // 如果用户已登录，获取用户的文章
    if (user) {
      setLoading(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">个人资料</h1>
      
      {user && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">姓名</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">邮箱</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex space-x-4 mb-6">
        <Link 
          href="/profile" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          我的资料
        </Link>
        <Link 
          href="/profile/posts" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          我的文章
        </Link>
        <Link 
          href="/profile/bookmarks" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          我的收藏
        </Link>
      </div>
    </div>
  );
} 