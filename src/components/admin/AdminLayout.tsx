'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: '仪表盘', path: '/admin' },
    { name: '文章管理', path: '/admin/posts' },
    { name: '阅读统计', path: '/admin/analytics' },
    { name: '评论管理', path: '/admin/comments' },
    { name: '用户管理', path: '/admin/users' },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">管理后台</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`block px-4 py-2 rounded-md ${
                    pathname === item.path 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* 移动端导航 */}
      <div className="md:hidden w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">管理后台</h2>
        <button 
          className="text-gray-600 hover:text-gray-900"
          // 这里可以添加移动端菜单切换逻辑
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 