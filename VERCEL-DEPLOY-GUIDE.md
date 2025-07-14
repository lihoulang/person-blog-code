# Vercel部署指南

## 准备工作

1. 确保您已经修复了登录功能的问题
2. 将最新代码推送到您的GitHub仓库

## 部署步骤

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New..." > "Project"
3. 导入您的GitHub仓库 `person-blog-code`
4. 配置项目:
   - 构建命令: `next build`
   - 输出目录: `.next`
   - 安装命令: `npm install`
   - 源码目录: `person-blog-code`（重要！）

5. 环境变量:
   - 添加 `JWT_SECRET`：一个长而复杂的随机字符串
   - 添加 `DATABASE_URL`：您的数据库连接字符串

6. 点击 "Deploy" 开始部署

## 部署后检查

1. 部署完成后，打开生成的URL
2. 尝试注册和登录功能
3. 如果遇到问题，查看Vercel日志以获取更多信息

## 常见问题解决

1. **登录功能不工作**:
   - 检查环境变量 `JWT_SECRET` 是否已设置
   - 确认数据库连接是否正常
   - 检查中间件配置是否正确

2. **数据库连接问题**:
   - Vercel上使用PostgreSQL比SQLite更合适
   - 可以使用Vercel提供的Postgres集成

3. **其他问题**:
   - 查看Vercel部署日志
   - 确保所有API路由正确实现 