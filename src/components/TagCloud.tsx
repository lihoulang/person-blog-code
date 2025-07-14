'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tag = {
  name: string;
  count: number;
};

interface TagCloudProps {
  tags: Tag[];
  className?: string;
}

export default function TagCloud({ tags, className = '' }: TagCloudProps) {
  const pathname = usePathname();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 计算标签权重
  const maxCount = Math.max(...tags.map(tag => tag.count));
  
  // 根据路径获取当前标签
  useEffect(() => {
    if (pathname.startsWith('/tags/')) {
      const tagFromPath = pathname.split('/').pop();
      setSelectedTag(tagFromPath || null);
    } else {
      setSelectedTag(null);
    }
  }, [pathname]);

  // 计算标签大小类名
  const getTagSize = (count: number) => {
    // 根据标签文章数量确定字体大小
    const ratio = count / maxCount;
    
    if (ratio > 0.8) return 'text-xl';
    if (ratio > 0.6) return 'text-lg';
    if (ratio > 0.4) return 'text-base';
    if (ratio > 0.2) return 'text-sm';
    return 'text-xs';
  };

  // 标签排序
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sortedTags.map((tag) => (
          <Link 
            key={tag.name} 
          href={`/tags/${tag.name}`}
          className={`inline-block px-3 py-1 rounded-full transition-colors ${
            selectedTag === tag.name
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          } ${getTagSize(tag.count)}`}
          >
          <span>{tag.name}</span>
          <span className="ml-1 text-xs">({tag.count})</span>
          </Link>
        ))}
    </div>
  );
} 