# 个人博客部署指南

## 静态文件部署（推荐方法）

您已经构建了静态网站文件（在`out`目录），可以通过以下方式部署：

### 方法一：使用GitHub Desktop（最简单）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 打开应用并使用您的GitHub账户登录（819317636@qq.com）
3. 如果仓库已存在：
   - 克隆 https://github.com/lihoulang/person-blog.git 仓库到本地
   - 创建一个新的分支，如 `gh-pages`
4. 如果仓库不存在：
   - 创建一个新仓库命名为 `person-blog`
5. 将`out`目录中的所有文件复制到仓库根目录
6. 提交更改，添加消息如"Add static website files"
7. 推送到GitHub

### 方法二：直接在GitHub网站上传文件

1. 访问 https://github.com/new 创建一个新仓库（如果需要）
2. 在仓库页面，点击"Add file" > "Upload files"
3. 将`out`目录中的所有文件拖放到上传区域
4. 添加提交消息并点击"Commit changes"

### 启用GitHub Pages

1. 在GitHub仓库页面，点击"Settings"
2. 滚动到"Pages"部分（在左侧菜单中）
3. 在"Source"下拉菜单中选择您的分支（main或gh-pages）
4. 点击"Save"
5. 等待几分钟，您的网站将在 https://lihoulang.github.io/person-blog/ 上线

## 重要文件说明

- `.nojekyll`：告诉GitHub Pages不要使用Jekyll处理您的网站
- `404.html`：自定义404错误页面
- `next.config.js`：已配置为支持GitHub Pages的静态导出

## 故障排除

如果部署后网站显示404错误：

1. 确保您的仓库名称为`person-blog`（与`basePath`配置匹配）
2. 检查GitHub Pages是否正确启用
3. 确保所有文件都已上传，特别是`.nojekyll`文件
4. 等待几分钟，GitHub Pages可能需要一些时间来处理更改

## 本地测试部署

如果您想在推送前测试静态构建：

```bash
cd out
npx serve
```

然后访问 http://localhost:3000 查看您的网站。 