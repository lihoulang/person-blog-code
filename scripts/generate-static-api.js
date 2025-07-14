const fs = require('fs');
const path = require('path');

// 确保输出目录存在
const outDir = path.join(process.cwd(), 'out');
const apiDir = path.join(outDir, 'api');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// 创建.nojekyll文件，确保GitHub Pages不会使用Jekyll处理我们的文件
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('创建.nojekyll文件');

// 生成一些静态API响应
const staticApiData = {
  // 静态博客文章列表
  'posts.json': JSON.stringify({
    posts: [
      {
        id: 1,
        title: '你好，世界！',
        slug: 'hello-world',
        description: '我的第一篇博客文章',
        publishedAt: new Date().toISOString(),
        tags: ['技术', '生活'],
        author: {
          name: '管理员',
          email: '819317636@qq.com'
        }
      },
      {
        id: 2,
        title: 'Next.js入门指南',
        slug: 'getting-started-with-nextjs',
        description: '了解如何使用Next.js构建现代化Web应用',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['Web开发', 'React', 'Next.js'],
        author: {
          name: '管理员',
          email: '819317636@qq.com'
        }
      }
    ]
  }),

  // 用户信息
  'user.json': JSON.stringify({
    user: {
      id: 1,
      name: '管理员',
      email: '819317636@qq.com'
    }
  }),

  // 标签列表
  'tags.json': JSON.stringify({
    tags: ['技术', '生活', 'Web开发', 'React', 'Next.js']
  })
};

// 写入静态API文件
Object.entries(staticApiData).forEach(([filename, data]) => {
  fs.writeFileSync(path.join(apiDir, filename), data);
  console.log(`Generated static API: ${filename}`);
});

console.log('Static API generation complete!'); 