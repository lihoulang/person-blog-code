// 这个脚本只在构建时运行，不会在浏览器环境中执行
// 因此可以安全使用Node.js的fs模块

const fs = require('fs');
const path = require('path');
const { Feed } = require('feed');
const { PrismaClient } = require('@prisma/client');

// 初始化Prisma客户端
const prisma = new PrismaClient();

// 网站信息
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog-url.com';
const siteTitle = '个人技术博客';
const siteDescription = '分享Web开发、编程技术和个人见解';
const siteAuthor = {
  name: '博主',
  email: 'example@example.com',
  link: siteUrl
};

// 创建Feed实例
function createFeed() {
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'zh-CN',
    image: `${siteUrl}/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteAuthor.name}`,
    updated: new Date(),
    generator: 'Feed for Node.js',
    feedLinks: {
      rss2: `${siteUrl}/rss.xml`,
      atom: `${siteUrl}/atom.xml`,
      json: `${siteUrl}/feed.json`,
    },
    author: siteAuthor
  });

  return feed;
}

// 从数据库获取文章并添加到Feed
async function generateFeeds() {
  try {
    console.log('开始生成RSS/Atom订阅源...');
    
    // 获取所有已发布的文章
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // 最新的20篇文章
    });

    // 创建Feed实例
    const feed = createFeed();

    // 添加文章到Feed
    posts.forEach(post => {
      const url = `${siteUrl}/blog/${post.slug}`;
      
      feed.addItem({
        title: post.title,
        id: url,
        link: url,
        description: post.description,
        content: post.content,
        author: [
          {
            name: post.author?.name || siteAuthor.name,
            email: post.author?.email || siteAuthor.email,
            link: siteUrl
          }
        ],
        date: post.createdAt,
        image: post.coverImage,
        category: post.tags.map(tag => ({
          name: tag.name
        }))
      });
    });

    // 确保public目录存在
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 写入RSS文件
    fs.writeFileSync(path.join(publicDir, 'rss.xml'), feed.rss2());
    console.log('RSS文件已生成');

    // 写入Atom文件
    fs.writeFileSync(path.join(publicDir, 'atom.xml'), feed.atom1());
    console.log('Atom文件已生成');

    // 写入JSON Feed文件
    fs.writeFileSync(path.join(publicDir, 'feed.json'), feed.json1());
    console.log('JSON Feed文件已生成');

    console.log('订阅源生成完成！');
  } catch (error) {
    console.error('生成订阅源时出错:', error);
  } finally {
    // 关闭Prisma连接
    await prisma.$disconnect();
  }
}

// 执行生成
generateFeeds(); 