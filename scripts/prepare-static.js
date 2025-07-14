const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 临时备份原始的src/app目录
const srcAppDir = path.join(process.cwd(), 'src/app');
const backupDir = path.join(process.cwd(), 'src/app-backup');

// 备份源文件
console.log('备份原始app目录...');
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}
fs.cpSync(srcAppDir, backupDir, { recursive: true });

// 删除所有api路由
console.log('删除API路由...');
const apiDir = path.join(srcAppDir, 'api');
if (fs.existsSync(apiDir)) {
  fs.rmSync(apiDir, { recursive: true, force: true });
}

// 列出所有可能包含动态路由的目录
const dirs = [
  'admin',
  'auth',
  'changelog',
  'dashboard',
  'search',
  'tags',
  'user',
  'profile'
];

// 删除这些目录
console.log('删除可能导致构建失败的动态路由...');
for (const dir of dirs) {
  const dirPath = path.join(srcAppDir, dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// 检查并删除blog目录下的动态路由
console.log('检查博客目录下的动态路由...');
const blogDir = path.join(srcAppDir, 'blog');
if (fs.existsSync(blogDir)) {
  // 保留我们创建的两个静态博客页面
  const keepers = ['hello-world', 'getting-started-with-nextjs'];
  
  // 读取博客目录下的所有条目
  const entries = fs.readdirSync(blogDir, { withFileTypes: true });
  
  // 遍历并删除不在保留列表中的目录
  for (const entry of entries) {
    if (entry.isDirectory() && !keepers.includes(entry.name)) {
      const dirPath = path.join(blogDir, entry.name);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`删除动态博客路由: ${entry.name}`);
    }
  }
}

// 删除blog/tags目录
const blogTagsDir = path.join(srcAppDir, 'blog/tags');
if (fs.existsSync(blogTagsDir)) {
  fs.rmSync(blogTagsDir, { recursive: true, force: true });
  console.log('删除blog/tags目录');
}

console.log('准备工作完成，现在可以执行npm run build'); 