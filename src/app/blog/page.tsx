import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/blog';
import SEO from '@/components/SEO';
import { generateBreadcrumbSchema } from '@/lib/seo';

// 设置为服务端渲染
export const dynamic = 'force-dynamic';

// 添加元数据
export const metadata: Metadata = {
  title: '博客文章',
  description: '探索我的最新文章和想法，涵盖技术、开发和个人成长等各种话题。',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: '博客文章 - 个人博客',
    description: '探索我的最新文章和想法，涵盖技术、开发和个人成长等各种话题。',
    url: '/blog',
    type: 'website',
  }
};

export default async function BlogPage() {
  // 获取所有文章
  const posts = await getAllPosts();

  // 添加封面图片URL和格式化日期
  const postsWithCovers = posts.map(post => ({
    ...post,
    coverImage: post.coverImage || 'https://placehold.co/600x400/e2e8f0/475569?text=Blog+Post',
    formattedDate: new Date(post.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }));
  
  // 生成面包屑导航结构化数据
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '首页', url: '/' },
    { name: '博客', url: '/blog' }
  ]);
  
  // 创建文章列表结构化数据
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: postsWithCovers.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/blog/${post.slug}`,
      name: post.title,
      description: post.description
    }))
  };
  
  // 合并结构化数据
  const structuredData = [breadcrumbSchema, itemListSchema];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* 添加SEO组件 */}
      <SEO structuredData={structuredData} />
      
      {/* 博客页面头部 */}
      <div className="mb-8 sm:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">博客文章</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mb-4">
          探索我的最新文章和想法，涵盖技术、开发和个人成长等各种话题。
        </p>
        
        {/* 订阅按钮 */}
        <div className="flex justify-center space-x-3 mt-3">
          <a 
            href="/rss.xml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
            </svg>
            RSS订阅
          </a>
          <a 
            href="/atom.xml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
            </svg>
            Atom订阅
          </a>
        </div>
      </div>

      {/* 特色文章 - 使用Next.js的Image组件 */}
      {postsWithCovers.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">特色文章</h2>
          <div className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <Image
              src={postsWithCovers[0].coverImage}
              alt={postsWithCovers[0].title}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                <Link href={`/blog/${postsWithCovers[0].slug}`} className="hover:underline">
                  {postsWithCovers[0].title}
                </Link>
              </h3>
              <p className="text-white/80 mb-3 text-sm sm:text-base line-clamp-2">{postsWithCovers[0].description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {postsWithCovers[0].tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="bg-white/20 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <Link 
                href={`/blog/${postsWithCovers[0].slug}`}
                className="inline-block bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-md hover:bg-blue-700 transition-colors mt-2"
              >
                阅读文章
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* 文章列表 - 使用PostCard组件 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {postsWithCovers.slice(1).map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* 如果没有文章 */}
      {postsWithCovers.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          暂无文章
        </div>
      )}
    </div>
  );
} 