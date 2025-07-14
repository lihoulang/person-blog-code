# GitHub Pages 部署指南

本指南将帮助你将个人博客部署到GitHub Pages。

## 准备工作

1. 在GitHub上创建一个新的仓库，命名为 `person-blog`

2. 修改 `package.json` 中的 `homepage` 字段，将 `USERNAME` 替换为你的GitHub用户名：
   ```json
   "homepage": "https://USERNAME.github.io/person-blog",
   ```

3. 同时修改 `next.config.js` 中的 `basePath`，确保在生产环境中使用正确的路径：
   ```js
   basePath: process.env.NODE_ENV === 'production' ? '/person-blog' : '',
   ```

## 部署步骤

1. 初始化Git仓库并提交代码：

```bash
git init
git add .
git commit -m "初始提交"
git branch -M main
git remote add origin https://github.com/USERNAME/person-blog.git
git push -u origin main
```

2. 在GitHub仓库设置中启用GitHub Pages：
   - 访问你的仓库 → Settings → Pages
   - Source 选择 "GitHub Actions"

3. 当你推送代码到main分支时，GitHub Actions会自动运行部署工作流，将网站部署到GitHub Pages。

## 验证部署

部署完成后，你可以通过以下URL访问你的网站：
```
https://USERNAME.github.io/person-blog/
```

## 自定义域名（可选）

如果你想使用自定义域名，可以按照以下步骤操作：

1. 在GitHub仓库的Settings → Pages → Custom domain中添加你的域名

2. 在你的DNS提供商处，添加以下记录：
   - 如果使用apex域名（example.com）：
     - A记录：指向185.199.108.153
     - A记录：指向185.199.109.153
     - A记录：指向185.199.110.153
     - A记录：指向185.199.111.153
   - 如果使用子域名（blog.example.com）：
     - CNAME记录：指向USERNAME.github.io

3. 修改 `package.json` 和 `next.config.js` 中的域名配置

## 故障排除

如果部署过程中遇到问题，请检查：

1. GitHub Actions 日志，了解构建或部署错误
2. 确保 `package.json` 中的 `homepage` 字段配置正确
3. 确保 `next.config.js` 中的 `basePath` 配置正确

## 更新网站

要更新网站内容，只需：

1. 修改相应的文件
2. 提交并推送更改到GitHub
3. GitHub Actions会自动重新部署网站 