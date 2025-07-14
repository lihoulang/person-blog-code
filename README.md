# 个人博客系统

这是一个基于Next.js构建的现代化个人博客系统，专为内容创作者设计。

## 特点

- 🚀 基于Next.js的高性能静态生成
- 📝 Markdown/MDX支持，轻松创作内容
- 🎨 使用Tailwind CSS的现代美观设计
- 🔍 内置搜索功能
- 📊 隐私友好的分析
- 💬 基于GitHub的评论系统

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 部署到GitHub Pages

本项目已配置GitHub Actions，可自动部署到GitHub Pages。

1. 将代码推送到你的GitHub仓库：

```bash
git init
git add .
git commit -m "初始提交"
git branch -M main
git remote add origin https://github.com/你的用户名/person-blog.git
git push -u origin main
```

2. 在GitHub仓库设置中，启用GitHub Pages功能：
   - 进入仓库的Settings > Pages
   - Source选择"GitHub Actions"

3. 完成以上步骤后，每次推送到main分支都会自动部署网站

## 项目结构

```
├── src/
│   ├── app/        # Next.js应用路由
│   ├── components/ # React组件
│   ├── content/    # 博客内容(Markdown/MDX)
│   ├── lib/        # 工具函数
│   └── styles/     # 全局样式
├── public/         # 静态资源
├── prisma/         # 数据库模型
└── .github/        # GitHub Actions工作流
```

## 许可

MIT 