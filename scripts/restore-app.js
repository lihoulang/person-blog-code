const fs = require('fs');
const path = require('path');

// 还原原始的src/app目录
const srcAppDir = path.join(process.cwd(), 'src/app');
const backupDir = path.join(process.cwd(), 'src/app-backup');

console.log('还原原始app目录...');
if (fs.existsSync(srcAppDir)) {
  fs.rmSync(srcAppDir, { recursive: true, force: true });
}

if (fs.existsSync(backupDir)) {
  fs.cpSync(backupDir, srcAppDir, { recursive: true });
  fs.rmSync(backupDir, { recursive: true, force: true });
  console.log('原始app目录已恢复。');
} else {
  console.error('找不到备份目录，无法恢复原始文件。');
  process.exit(1);
} 