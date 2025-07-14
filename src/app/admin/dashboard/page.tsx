'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  postCount: number;
  commentCount: number;
  userCount: number;
  subscriberCount: number;
  tagCount: number;
  viewCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    postCount: 0,
    commentCount: 0,
    userCount: 0,
    subscriberCount: 0,
    tagCount: 0,
    viewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('获取统计数据失败');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('获取统计数据出错:', err);
        setError('获取统计数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // 统计卡片数据
  const statCards = [
    { title: '文章总数', value: stats.postCount, icon: '📝', link: '/admin/posts', color: 'bg-blue-500' },
    { title: '评论总数', value: stats.commentCount, icon: '💬', link: '/admin/comments', color: 'bg-green-500' },
    { title: '用户总数', value: stats.userCount, icon: '👥', link: '/admin/users', color: 'bg-purple-500' },
    { title: '订阅者数', value: stats.subscriberCount, icon: '📧', link: '/admin/subscribers', color: 'bg-yellow-500' },
    { title: '标签总数', value: stats.tagCount, icon: '🏷️', link: '/admin/tags', color: 'bg-pink-500' },
    { title: '总浏览量', value: stats.viewCount, icon: '👁️', link: '#', color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Link href={card.link} key={index}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`${card.color} h-2`}></div>
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/posts/new" 
            className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">✏️</span>
            <span>创建新文章</span>
          </Link>
          <Link 
            href="/admin/comments?filter=unapproved" 
            className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">✅</span>
            <span>审核评论</span>
          </Link>
          <Link 
            href="/admin/tags/new" 
            className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">🏷️</span>
            <span>添加新标签</span>
          </Link>
          <Link 
            href="/admin/settings" 
            className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <span>系统设置</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 