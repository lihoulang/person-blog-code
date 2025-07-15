/**
 * SEO工具函数，用于生成结构化数据
 */

import { Post } from '@/types/post';

// 网站基础信息
const siteInfo = {
  name: '个人博客',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/logo.png`,
  inLanguage: 'zh-CN',
  description: '分享我的想法和经验的个人空间',
  author: {
    name: '博主',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  },
  social: {
    twitter: '@yourtwitterhandle',
    github: 'yourgithubusername',
  }
};

/**
 * 生成网站的JSON-LD结构化数据
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteInfo.url,
    name: siteInfo.name,
    description: siteInfo.description,
    inLanguage: siteInfo.inLanguage,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteInfo.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * 生成组织的JSON-LD结构化数据
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: siteInfo.url,
    name: siteInfo.name,
    logo: siteInfo.logo,
    sameAs: [
      `https://twitter.com/${siteInfo.social.twitter.replace('@', '')}`,
      `https://github.com/${siteInfo.social.github}`
    ]
  };
}

/**
 * 生成面包屑导航的JSON-LD结构化数据
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * 生成文章的JSON-LD结构化数据
 */
export function generateArticleSchema(post: Post) {
  const postUrl = `${siteInfo.url}/blog/${post.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    headline: post.title,
    description: post.description || '',
    image: post.coverImage ? `${siteInfo.url}${post.coverImage}` : siteInfo.logo,
    datePublished: post.date,
    dateModified: post.date, // 使用发布日期作为修改日期
    author: {
      '@type': 'Person',
      name: post.author || siteInfo.author.name,
      url: siteInfo.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: siteInfo.name,
      logo: {
        '@type': 'ImageObject',
        url: siteInfo.logo
      }
    },
    keywords: post.tags?.join(', ') || '',
    inLanguage: siteInfo.inLanguage
  };
}

/**
 * 生成作者的JSON-LD结构化数据
 */
export function generatePersonSchema(name: string, description?: string, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: description || '',
    image: image ? `${siteInfo.url}${image}` : undefined,
    url: `${siteInfo.url}/about`,
    sameAs: [
      `https://twitter.com/${siteInfo.social.twitter.replace('@', '')}`,
      `https://github.com/${siteInfo.social.github}`
    ]
  };
}

/**
 * 生成FAQ的JSON-LD结构化数据
 */
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/**
 * 将结构化数据转换为字符串
 */
export function structuredDataToString(data: any) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
} 