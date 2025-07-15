'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  // 使用AuthContext
  const { user, logout } = useAuth();
  
  // 在路由变化时关闭移动菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 获取未读消息数量
  useEffect(() => {
    if (user) {
      fetchUnreadMessagesCount();
      
      // 每60秒检查一次未读消息
      const interval = setInterval(fetchUnreadMessagesCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // 获取未读消息数量
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadMessagesCount(data.count);
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  };

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    
    // 只在菜单打开时添加事件监听器
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // 导航链接
  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/blog', label: '博客' },
    { href: '/tags', label: '标签' },
    { href: '/roadmap', label: '项目规划' },
    { href: '/changelog', label: '更新日志' },
    { href: '/about', label: '关于' },
  ];
  
  // 获取用户链接，根据登录状态显示不同选项
  const getUserLinks = () => {
    if (user) {
      return [
        { href: '/profile', label: '个人资料', show: true },
        { 
          href: '/profile/messages', 
          label: '我的消息', 
          show: true,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
        },
        { href: '/profile/bookmarks', label: '我的收藏', show: true },
        { href: '/profile/posts', label: '我的文章', show: true },
        { href: '/posts/create', label: '写新文章', show: true },
        { href: '/admin/posts', label: '文章管理', show: user.role === 'admin' },
        { href: '/admin/changelog', label: '更新日志', show: user.role === 'admin' },
        { href: '#', label: '登出', onClick: () => logout(), show: true },
      ];
    } else {
      return [
        { href: '/auth/login', label: '登录', show: true },
        { href: '/auth/register', label: '注册', show: true },
      ];
    }
  };
  
  const userLinks = getUserLinks();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="text-blue-600 mr-1">✍️</span> 个人博客
          </Link>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-4">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === link.href 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* 搜索框 */}
            <SearchBar className="w-64" />
            
            {/* 用户链接 */}
            <div className="flex space-x-4">
              {user ? (
                <div className="relative ml-3">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">打开用户菜单</span>
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {unreadMessagesCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </div>
                    )}
                  </button>

                  {/* 用户菜单 */}
                  {showUserMenu && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      {userLinks.map((link, index) => 
                        link.show && (
                          <Link
                            key={link.href + index}
                            href={link.href}
                            onClick={() => {
                              if (link.onClick) link.onClick();
                              setShowUserMenu(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
                            role="menuitem"
                          >
                            {link.label}
                            {link.badge && (
                              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {link.badge > 9 ? '9+' : link.badge}
                              </span>
                            )}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 移动菜单按钮 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-300 dark:hover:text-white"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">打开菜单</span>
              {/* 菜单图标 */}
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {unreadMessagesCount > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动菜单 - 使用过渡动画 */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-y-0 right-0 w-full sm:w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">菜单</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-md p-2 text-gray-700 hover:text-red-500 dark:text-gray-300"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 移动端搜索框 */}
          <div className="mb-6">
            <SearchBar placeholder="搜索文章..." />
          </div>

          <div className="space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-gray-800'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
            
          {/* 用户链接 - 移动版 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-1">
            {user ? (
              <>
                <div className="flex items-center px-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name || user.email}
                  </div>
                </div>
                {userLinks.map((link, index) => 
                  link.show && (
                    <Link
                      key={link.href + index}
                      href={link.href}
                      onClick={link.onClick}
                      className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-3 py-3 rounded-md text-base font-medium text-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 border border-gray-300"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-3 rounded-md text-base font-medium text-center text-white bg-blue-600 hover:bg-blue-700"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
          
          {/* 移动端底部信息 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">© 2025 个人博客</p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="hover:text-blue-600">隐私政策</Link>
              <Link href="/terms" className="hover:text-blue-600">使用条款</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* 移动菜单背景遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
} 