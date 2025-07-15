'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface SEOProps {
  structuredData?: any;
}

/**
 * SEO组件，用于在页面中添加结构化数据
 * 
 * 使用方法：
 * <SEO structuredData={structuredData} />
 */
export default function SEO({ structuredData }: SEOProps) {
  useEffect(() => {
    // 在客户端渲染时，可以在这里添加额外的SEO相关逻辑
  }, []);

  if (!structuredData) {
    return null;
  }

  return (
    <>
      <Script 
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
} 