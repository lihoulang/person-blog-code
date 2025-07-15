const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 转义XML特殊字符
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 生成RSS 2.0格式的Feed
function generateRssFeed(posts, baseUrl) {
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

// 生成Atom 1.0格式的Feed
function generateAtomFeed(posts, baseUrl) {
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
    const updated = new Date(post.updatedAt || post.date).toISOString();
    const published = new Date(post.date).toISOString();
    const summary = post.description || '';
    const author = post.author ? post.author : authorName;
    
    atom += `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html" />
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${escapeXml(summary)}</summary>
    ${post.content ? `<content type="html"><![CDATA[${post.content}]]></content>` : ''}
    <author><name>${escapeXml(author)}</name></author>
    ${post.tags && post.tags.length > 0 ? post.tags.map(tag => `<category term="${escapeXml(tag)}" />`).join('\n    ') : ''}
  </entry>`;
  });
  
  // 关闭Atom
  atom += `
</feed>`;

  return atom;
}

// 主函数
async function generateFeeds() {
  try {
    console.log('开始生成RSS和Atom feed...');
    
    // 从数据库获取已发布的文章
    const posts = await prisma.post.findMany({
      where: {
        published: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 20,
      include: {
        author: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      }
    });
    
    // 格式化文章数据
    const formattedPosts = posts.map(post => ({
      title: post.title,
      slug: post.slug,
      date: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      content: post.content,
      description: post.description,
      tags: post.tags.map(tag => tag.name),
      author: post.author?.name
    }));
    
    // 获取网站基础URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // 生成RSS内容
    const rssContent = generateRssFeed(formattedPosts, baseUrl);
    
    // 生成Atom内容
    const atomContent = generateAtomFeed(formattedPosts, baseUrl);
    
    // 确保public目录存在
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // 写入RSS文件
    fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssContent);
    console.log('RSS feed已生成: public/rss.xml');
    
    // 写入Atom文件
    fs.writeFileSync(path.join(publicDir, 'atom.xml'), atomContent);
    console.log('Atom feed已生成: public/atom.xml');
    
  } catch (error) {
    console.error('生成feed失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行生成
generateFeeds(); 