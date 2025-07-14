const fs = require('fs');
const path = require('path');

// 确保输出目录存在
const outDir = path.join(process.cwd(), 'out');

// 创建.nojekyll文件
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('创建.nojekyll文件');

// 创建404.html (与index.html相同，这样可以支持SPA导航)
const indexPath = path.join(outDir, 'index.html');
const notFoundPath = path.join(outDir, '404.html');

if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath);
  fs.writeFileSync(notFoundPath, indexContent);
  console.log('创建404.html');
}

// 不再创建CNAME文件
// const cnamePath = path.join(outDir, 'CNAME');
// if (!fs.existsSync(cnamePath)) {
//   fs.writeFileSync(cnamePath, 'lihoulang.github.io');
//   console.log('创建CNAME文件');
// }

console.log('GitHub Pages准备完成！'); 