'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function UserPostsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user) {
      setLoading(false);
      // 这里应该获取用户的文章，但目前只是示例
      setPosts([]);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">我的文章</h2>
        <Link 
          href="/posts/create" 
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          写新文章
        </Link>
      </div>
      
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
  );
} 
      <div className="flex space-x-4 mb-6">
        <Link 
          href="/profile" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          我的资料
        </Link>
        <Link 
          href="/profile/posts" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
      
      <div className="bg-white shadow rounded-lg p-6">
        {posts.length > 0 ? (
          <div className="divide-y">
            {/* 这里应该渲染文章列表，但目前只是示例 */}
            <p>您还没有发布任何文章。</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">您还没有发布任何文章。</p>
            <Link 
              href="/posts/create" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              写第一篇文章
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 