'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

// 收藏文章类型定义
interface BookmarkedPost {
  id: string;
  postId: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage?: string;
    date: string;
    viewCount: number;
  };
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // 加载用户收藏
  useEffect(() => {
    if (user) {
      fetchUserBookmarks();
    }
  }, [user]);

  // 获取用户收藏
  const fetchUserBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/bookmarks', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('获取收藏失败');
      }
      
      const data = await response.json();
      setBookmarks(data.bookmarks);
    } catch (error) {
      console.error('获取收藏失败:', error);
      toast.error('获取收藏失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 移除收藏
  const removeBookmark = async (bookmarkId: string) => {
    try {
      setRemoving(bookmarkId);
      
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('移除收藏失败');
      }
      
      // 从列表中移除已删除的收藏
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkId));
      toast.success('已从收藏中移除');
    } catch (error) {
      console.error('移除收藏失败:', error);
      toast.error('移除收藏失败，请重试');
    } finally {
      setRemoving(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-xl font-medium mb-6">我的收藏</h2>
      
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="flex border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* 文章封面图 */}
              <div className="w-1/4 relative h-auto min-h-[120px]">
                <Image
                  src={bookmark.post.coverImage || '/images/default-post-cover.jpg'}
                  alt={bookmark.post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100px, 200px"
                />
              </div>
              
              {/* 文章信息 */}
              <div className="w-3/4 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    href={`/blog/${bookmark.post.slug}`}
                    className="text-lg font-medium text-blue-600 hover:underline"
                  >
                    {bookmark.post.title}
                  </Link>
                  <span className="text-sm text-gray-500">
                    收藏于 {formatDate(bookmark.createdAt)}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {bookmark.post.description || '暂无描述'}
                </p>
                
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="flex items-center mr-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {bookmark.post.viewCount || 0}
                    </span>
                    <span>
                      {formatDate(bookmark.post.date)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Link 
                      href={`/blog/${bookmark.post.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      阅读
                    </Link>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      disabled={removing === bookmark.id}
                      className={`text-sm text-red-600 hover:underline ${
                        removing === bookmark.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {removing === bookmark.id ? '移除中...' : '取消收藏'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-4">您还没有收藏任何文章</p>
          <Link 
            href="/blog"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            浏览文章并添加收藏
          </Link>
        </div>
      )}
    </div>
  );
} 