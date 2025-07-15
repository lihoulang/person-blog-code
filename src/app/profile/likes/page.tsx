'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

// 点赞文章类型定义
interface LikedPost {
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

export default function LikesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [likes, setLikes] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // 加载用户点赞
  useEffect(() => {
    // 如果用户未登录且加载完成，重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // 如果用户已登录，获取用户的点赞
    if (user) {
      fetchUserLikes();
    }
  }, [user, isLoading, router]);

  // 获取用户点赞
  const fetchUserLikes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/likes', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('获取点赞失败');
      }
      
      const data = await response.json();
      setLikes(data.likes);
    } catch (error) {
      console.error('获取点赞失败:', error);
      toast.error('获取点赞失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消点赞
  const removeLike = async (likeId: string, postId: string) => {
    try {
      setRemoving(likeId);
      
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId,
          action: 'unlike' 
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('取消点赞失败');
      }
      
      // 从列表中移除已取消的点赞
      setLikes(likes.filter(like => like.id !== likeId));
      toast.success('已取消点赞');
    } catch (error) {
      console.error('取消点赞失败:', error);
      toast.error('取消点赞失败，请重试');
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

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">个人中心</h1>
      
      {/* 导航标签 */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <Link 
          href="/profile" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的资料
        </Link>
        <Link 
          href="/profile/posts" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的文章
        </Link>
        <Link 
          href="/profile/bookmarks" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的收藏
        </Link>
        <Link 
          href="/profile/likes" 
          className="px-4 py-2 font-medium text-sm text-blue-600 border-b-2 border-blue-600 transition-colors"
        >
          我的点赞
        </Link>
        <Link 
          href="/profile/comments" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的评论
        </Link>
      </div>
      
      {/* 点赞列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">我的点赞</h2>
          <p className="text-gray-500 text-sm mt-1">管理您点赞的文章</p>
        </div>
        
        <div className="p-6">
          {likes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {likes.map((like) => (
                <div key={like.id} className="flex border border-gray-200 rounded-lg overflow-hidden">
                  {/* 文章封面图 */}
                  <div className="w-1/4 relative h-auto min-h-[120px]">
                    <Image
                      src={like.post.coverImage || 'https://placehold.co/600x400/e2e8f0/475569?text=Blog+Post'}
                      alt={like.post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100px, 200px"
                    />
                  </div>
                  
                  {/* 文章信息 */}
                  <div className="w-3/4 p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Link 
                        href={`/blog/${like.post.slug}`}
                        className="text-lg font-medium text-blue-600 hover:underline"
                      >
                        {like.post.title}
                      </Link>
                      <span className="text-sm text-gray-500">
                        点赞于 {formatDate(like.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {like.post.description || '暂无描述'}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="flex items-center mr-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {like.post.viewCount || 0}
                        </span>
                        <span>
                          {formatDate(like.post.date)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link 
                          href={`/blog/${like.post.slug}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          阅读
                        </Link>
                        <button
                          onClick={() => removeLike(like.id, like.postId)}
                          disabled={removing === like.id}
                          className={`text-sm text-red-600 hover:underline ${
                            removing === like.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {removing === like.id ? '取消中...' : '取消点赞'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>您还没有点赞任何文章</p>
              <Link 
                href="/blog"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                浏览文章并点赞
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 