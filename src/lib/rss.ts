import { Post } from '@/types/post';

/**
 * 生成RSS 2.0格式的Feed
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns RSS 2.0 XML字符串
 */
export function generateRssFeed(posts: Post[], baseUrl: string): string {
  const siteName = '个人博客';
  const siteDescription = '分享技术、生活和思考';
  const language = 'zh-cn';
  const now = new Date().toUTCString();
  
  // 构建RSS头部
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${siteName}</title>
  <link>${baseUrl}</link>
  <description>${siteDescription}</description>
  <language>${language}</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

  // 添加每篇文章
  posts.forEach(post => {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();
    const description = post.description || '';
    
    rss += `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <guid>${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(description)}</description>
    ${post.content ? `<content:encoded><![CDATA[${post.content}]]></content:encoded>` : ''}
    ${post.tags && post.tags.length > 0 ? post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n    ') : ''}
  </item>`;
  });
  
  // 关闭RSS
  rss += `
</channel>
</rss>`;

  return rss;
}

/**
 * 生成Atom 1.0格式的Feed
 * @param posts 博客文章列表
 * @param baseUrl 网站基础URL
 * @returns Atom 1.0 XML字符串
 */
export function generateAtomFeed(posts: Post[], baseUrl: string): string {
  const siteName = '个人博客';
  const siteDescription = '分享技术、生活和思考';
  const authorName = '博客作者';
  const authorEmail = 'author@example.com';
  const now = new Date().toISOString();
  
  // 构建Atom头部
  let atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${siteName}</title>
  <subtitle>${siteDescription}</subtitle>
  <link href="${baseUrl}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${baseUrl}" rel="alternate" type="text/html" />
  <updated>${now}</updated>
  <id>${baseUrl}/</id>
  <author>
    <name>${authorName}</name>
    <email>${authorEmail}</email>
  </author>
`;

  // 添加每篇文章
  posts.forEach(post => {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const updated = new Date(post.date).toISOString();
    const published = new Date(post.date).toISOString();
    const summary = post.description || '';
    
    atom += `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html" />
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${escapeXml(summary)}</summary>
    ${post.content ? `<content type="html"><![CDATA[${post.content}]]></content>` : ''}
    ${post.author ? `<author><name>${escapeXml(post.author)}</name></author>` : ''}
    ${post.tags && post.tags.length > 0 ? post.tags.map(tag => `<category term="${escapeXml(tag)}" />`).join('\n    ') : ''}
  </entry>`;
  });
  
  // 关闭Atom
  atom += `
</feed>`;

  return atom;
}

/**
 * 转义XML特殊字符
 * @param text 需要转义的文本
 * @returns 转义后的文本
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 