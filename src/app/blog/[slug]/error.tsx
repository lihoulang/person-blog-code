'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 将错误记录到控制台，以便进行调试
    console.error('文章详情页面错误:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">文章加载失败</h1>
        <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>
        
        <p className="text-gray-700 mb-6">
          抱歉，在加载文章详情时发生了错误。这可能是由于临时的服务器问题或网络连接问题导致的。
        </p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-8 text-left">
          <p className="text-sm text-gray-600 mb-2">错误信息：</p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            {error.message || '未知错误'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试加载
          </button>
          <Link 
            href="/blog"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            返回博客列表
          </Link>
        </div>
      </div>
    </div>
  );
} 

import { useEffect } from 'react';
import Link from 'next/link';

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 将错误记录到控制台，以便进行调试
    console.error('文章详情页面错误:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">文章加载失败</h1>
        <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>
        
        <p className="text-gray-700 mb-6">
          抱歉，在加载文章详情时发生了错误。这可能是由于临时的服务器问题或网络连接问题导致的。
        </p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-8 text-left">
          <p className="text-sm text-gray-600 mb-2">错误信息：</p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            {error.message || '未知错误'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试加载
          </button>
          <Link 
            href="/blog"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            返回博客列表
          </Link>
        </div>
      </div>
    </div>
  );
} 