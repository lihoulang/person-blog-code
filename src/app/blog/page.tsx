import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/blog';

// 设置为服务端渲染
export const dynamic = 'force-dynamic';

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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* 博客页面头部 */}
      <div className="mb-8 sm:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">博客文章</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          探索我的最新文章和想法，涵盖技术、开发和个人成长等各种话题。
        </p>
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