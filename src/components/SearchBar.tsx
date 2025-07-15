'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (_query: string) => void;
  autoFocus?: boolean;
  showAdvancedSearch?: boolean;
}

export default function SearchBar({ 
  className = '', 
  placeholder = '搜索文章...',
  initialValue = '',
  onSearch,
  autoFocus = false,
  showAdvancedSearch = false
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // 当initialValue变化时更新query
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);
  
  // 设置自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    
    if (trimmedQuery) {
      // 如果提供了onSearch回调，使用它
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        // 否则导航到搜索页面
        router.push(`/blog/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };
  
  const handleChange = (value: string) => {
    setQuery(value);
    
    // 如果提供了onSearch回调，在用户输入时触发
    if (onSearch && value.trim().length >= 2) {
      onSearch(value);
    }
  };
  
  // 获取当前时间，精确到秒
  const currentTime = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  return (
    <div className={className}>
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {showAdvancedSearch && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-10 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="高级搜索"
            title="高级搜索"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        )}
        
        <button
          type="submit"
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="搜索"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
            />
          </svg>
        </button>
        
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-9 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="清除搜索"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </form>
      
      {showAdvancedSearch && showFilters && (
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="text-xs text-gray-500 mb-2">
            高级搜索选项 - {new Date().toLocaleDateString('zh-CN')} {currentTime}
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search?sortBy=date&sortOrder=desc');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              按最新发布排序
            </button>
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search?sortBy=views&sortOrder=desc');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              按阅读量排序
            </button>
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search?sortBy=comments&sortOrder=desc');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              按评论数排序
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search?readTime=short');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              只看短文 (&lt;5分钟)
            </button>
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search?readTime=long');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              只看长文 (&gt;15分钟)
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              type="button"
              onClick={() => {
                router.push('/blog/search');
                setShowFilters(false);
              }}
              className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
            >
              高级搜索页面
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 