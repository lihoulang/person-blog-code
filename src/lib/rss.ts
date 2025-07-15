import { Feed } from 'feed';
import { Post } from '@/types/post';
import { marked } from 'marked';

/**
 * 生成Feed对象
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns Feed对象
 */
function createFeed(posts: Post[], baseUrl: string): Feed {
  const siteName = '个人博客';
  const siteDescription = '分享技术、生活和思考';
  const authorName = '博客作者';
  const authorEmail = 'author@example.com';
  const now = new Date();
  
  // 创建Feed实例
  const feed = new Feed({
    title: siteName,
    description: siteDescription,
    id: baseUrl,
    link: baseUrl,
    language: 'zh-CN',
    image: `${baseUrl}/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `Copyright © ${now.getFullYear()} ${siteName}`,
    updated: now,
    feedLinks: {
      rss2: `${baseUrl}/rss.xml`,
      atom: `${baseUrl}/atom.xml`,
      json: `${baseUrl}/feed.json`,
    },
    author: {
      name: authorName,
      email: authorEmail,
      link: baseUrl
    }
  });

  // 添加每篇文章
  posts.forEach(post => {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.date);
    
    // 将Markdown转换为HTML（如果内容是Markdown格式）
    let contentHtml = post.content || '';
    if (post.content && !post.content.includes('<')) {
      try {
        // 使用同步API避免Promise问题
        contentHtml = marked.parse(post.content, { async: false }) as string;
      } catch (error) {
        console.error('Markdown解析错误:', error);
      }
    }
    
    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description,
      content: contentHtml,
      author: [
        {
          name: post.author || authorName,
          link: baseUrl
        }
      ],
      date: pubDate,
      image: post.coverImage ? `${baseUrl}${post.coverImage}` : undefined,
      category: post.tags?.map(tag => ({ name: tag })) || []
    });
  });

  return feed;
}

/**
 * 生成RSS 2.0格式的Feed
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns RSS 2.0 XML字符串
 */
export function generateRssFeed(posts: Post[], baseUrl: string): string {
  const feed = createFeed(posts, baseUrl);
  return feed.rss2();
}

/**
 * 生成Atom 1.0格式的Feed
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns Atom 1.0 XML字符串
 */
export function generateAtomFeed(posts: Post[], baseUrl: string): string {
  const feed = createFeed(posts, baseUrl);
  return feed.atom1();
}

/**
 * 生成JSON Feed
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns JSON Feed字符串
 */
export function generateJsonFeed(posts: Post[], baseUrl: string): string {
  const feed = createFeed(posts, baseUrl);
  return feed.json1();
} 