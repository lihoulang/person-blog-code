const fs = require('fs');
const path = require('path');

// 上传目录路径
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 检查目录是否存在，如果不存在则创建
if (!fs.existsSync(uploadDir)) {
  console.log(`创建上传目录: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(`上传目录已存在: ${uploadDir}`);
}

// 创建.gitkeep文件，确保目录被Git跟踪
const gitkeepPath = path.join(uploadDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
  console.log('创建.gitkeep文件以确保目录被Git跟踪');
}

console.log('上传目录初始化完成！'); 