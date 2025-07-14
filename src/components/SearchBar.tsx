'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({ 
  className = '', 
  placeholder = '搜索文章...',
  initialValue = '',
  onSearch,
  autoFocus = false
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
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
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative flex items-center ${className}`}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
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
  );
} 