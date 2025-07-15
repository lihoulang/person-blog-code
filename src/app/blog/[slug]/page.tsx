import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import PostViewTracker from '@/components/PostViewTracker';
import Comments from '@/components/Comments';
import ShareButtons from '@/components/ShareButtons';
import PostActions from '@/components/PostActions';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import SEO from '@/components/SEO';

// 强制动态渲染，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// 动态生成元数据
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  console.log('开始获取文章元数据，slug:', params.slug);
  
  try {
    const post = await getPostBySlug(params.slug);
    
    if (!post) {
      console.log('文章不存在，slug:', params.slug);
      return {
        title: '文章不存在 - 个人博客',
        description: '抱歉，您请求的文章不存在',
      };
    }
    
    console.log('成功获取文章元数据，标题:', post.title);
    
    return {
      title: `${post.title} - 个人博客`,
      description: post.description || `阅读关于${post.title}的文章`,
      openGraph: {
        title: post.title,
        description: post.description,
        type: 'article',
        publishedTime: post.date,
        authors: ['博主'],
        tags: post.tags,
      },
      // 添加更多SEO相关元数据
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${post.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        creator: '@yourtwitterhandle',
      },
      keywords: post.tags?.join(', '),
    };
  } catch (error) {
    console.error('获取文章元数据失败:', error);
    return {
      title: '文章加载失败 - 个人博客',
      description: '抱歉，加载文章时出错',
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  console.log('开始渲染文章页面，slug:', params.slug);
  
  try {
    const post = await getPostBySlug(params.slug);
    
    if (!post) {
      console.log('文章不存在，返回404页面，slug:', params.slug);
      notFound();
    }
    
    console.log('成功获取文章内容，标题:', post.title);
    
    // 获取相关文章
    const relatedPosts = await getRelatedPosts(post, 3);
    console.log(`获取到${relatedPosts.length}篇相关文章`);
    
    // 生成结构化数据
    const articleSchema = generateArticleSchema(post);
    
    // 生成面包屑导航结构化数据
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: '首页', url: '/' },
      { name: '博客', url: '/blog' },
      { name: post.title, url: `/blog/${post.slug}` }
    ]);
    
    // 合并结构化数据
    const structuredData = [articleSchema, breadcrumbSchema];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 添加SEO组件 */}
          <SEO structuredData={structuredData} />
          
          {/* 页面导航 */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="text-gray-700 hover:text-blue-600">
                    首页
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link href="/blog" className="text-gray-700 hover:text-blue-600">
                      博客
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500">{post.title}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* 文章标题和元数据 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
              <span className="mr-4">发布于 {post.date}</span>
              <span className="flex items-center mr-4">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.viewCount || 0} 次阅读
              </span>
            </div>
            
            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Link 
                    key={tag} 
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* 文章内容 */}
          <article className="prose prose-lg max-w-none mb-10" itemScope itemType="https://schema.org/BlogPosting">
            <meta itemProp="headline" content={post.title} />
            <meta itemProp="datePublished" content={post.date} />
            <meta itemProp="dateModified" content={post.date} />
            {post.description && <meta itemProp="description" content={post.description} />}
            {post.author && <meta itemProp="author" content={post.author} />}
            
            <div itemProp="articleBody" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          </article>
          
          {/* 点赞和收藏功能 */}
          <PostActions postId={post.id} />
          
          {/* 分享按钮 */}
          <div className="my-8">
            <h3 className="text-lg font-semibold mb-3">分享这篇文章</h3>
            <ShareButtons 
              title={post.title} 
              url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${post.slug}`}
              description={post.description || `阅读关于${post.title}的文章`}
              showText={true}
            />
          </div>
          
          {/* 相关文章 */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mt-8 mb-10">
              <h3 className="text-xl font-bold mb-6">你可能也喜欢</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.slug} 
                    href={`/blog/${relatedPost.slug}`}
                    className="block bg-white border rounded-lg hover:shadow-md transition-shadow p-4"
                  >
                    <h4 className="font-medium text-lg mb-2 line-clamp-2">{relatedPost.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        
        {/* 评论区 */}
          <Comments postId={post.id} postSlug={post.slug} />
        </div>
        
        {/* 文章阅读追踪组件 */}
        <PostViewTracker postId={post.id} />
      </div>
    );
  } catch (error) {
    console.error('渲染文章页面失败:', error);
    notFound();
  }
} 