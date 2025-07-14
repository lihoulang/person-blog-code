'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 检查用户是否有权限访问管理页面
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果没有用户或用户不是管理员，不显示内容
  if (!user || user.role !== 'admin') {
    return null;
  }

  // 管理菜单项
  const adminMenuItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/admin/posts', label: '文章管理', icon: '📝' },
    { path: '/admin/comments', label: '评论管理', icon: '💬' },
    { path: '/admin/users', label: '用户管理', icon: '👥' },
    { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
    { path: '/admin/subscribers', label: '订阅管理', icon: '📧' },
    { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">博客管理系统</h1>
        </div>
        <nav className="mt-4">
          <ul>
            {adminMenuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                    pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <Link 
            href="/"
            className="flex items-center text-gray-700 hover:text-blue-600"
          >
            <span className="mr-3">🏠</span>
            返回网站首页
          </Link>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
} 