# 将个人博客部署到Vercel的完整指南

## 前置准备

1. **GitHub账户**：确保您的项目代码已经推送到GitHub仓库
2. **Vercel账户**：使用GitHub账户登录 [Vercel](https://vercel.com)
3. **PostgreSQL数据库**：Vercel提供PostgreSQL数据库集成

## 第一步：准备项目

1. **确认项目结构**：确保您的项目是标准的Next.js项目结构
2. **检查next.config.js**：确保配置适用于Vercel部署，不包含静态导出设置
3. **准备.env.local文件**：本地开发时使用，包含必要的环境变量

## 第二步：登录Vercel

1. 访问 [Vercel官网](https://vercel.com)
2. 点击"Sign Up"或"Login"
3. 选择"Continue with GitHub"使用您的GitHub账户登录

## 第三步：导入项目

1. 登录后，点击"Add New..."按钮，然后选择"Project"
2. 在列出的GitHub仓库中找到并选择您的博客项目
3. 点击"Import"导入项目

## 第四步：配置项目

在配置页面上：

1. **项目名称**：保持默认或自定义名称
2. **框架预设**：确保自动选择了"Next.js"
3. **根目录**：如果您的项目不在根目录，请指定正确路径（例如：`person-blog-code`）
4. **构建设置**：
   - 构建命令：`npm run build`（默认）
   - 输出目录：`.next`（默认）
   - 安装命令：`npm install`（默认）

5. **环境变量**：点击"Environment Variables"添加以下变量：
   - `DATABASE_URL`：PostgreSQL数据库URL（稍后配置）
   - `JWT_SECRET`：一个安全的随机字符串
   - `NEXT_PUBLIC_BASE_URL`：部署后的应用URL

6. 点击"Deploy"开始部署

## 第五步：设置PostgreSQL数据库

1. 部署完成后，在项目仪表板中点击"Storage"选项卡
2. 选择"Connect Store" > "Create New" > "Postgres"
3. 选择合适的地区和计划（包括免费方案）
4. 点击"Create"创建数据库
5. 数据库创建后，Vercel会自动添加必要的环境变量到您的项目中

## 第六步：初始化数据库

数据库创建后，您需要运行迁移命令来初始化数据库架构：

1. 在Vercel仪表板中，转到"Deployments"选项卡
2. 找到最新的部署，点击进入
3. 点击右上角的三点菜单，选择"Open Console"
4. 在控制台中运行以下命令：
   ```
   npx prisma migrate deploy
   ```

## 第七步：验证部署

1. 部署完成后，点击"Visit"按钮访问您的应用
2. 测试以下功能是否正常工作：
   - 文章浏览
   - 用户注册/登录
   - 文章发布
   - 评论功能
   - 搜索功能

## 第八步：添加自定义域名（可选）

1. 在项目仪表板中，点击"Domains"选项卡
2. 输入您的域名并点击"Add"
3. 按照Vercel提供的DNS配置说明操作，通常包括：
   - 添加CNAME记录
   - 或者更改域名的nameservers

## 常见问题解决

### 部署失败

1. 检查构建日志找出错误原因
2. 确认所有环境变量都已正确设置
3. 验证项目依赖项是否完整

### 数据库连接问题

1. 确认`DATABASE_URL`环境变量格式正确
2. 检查IP限制设置，确保Vercel服务器可以访问数据库
3. 验证数据库用户权限

### API路由返回500错误

1. 检查服务器日志
2. 确认数据库模型与架构匹配
3. 验证JWT配置正确

## 更新应用

每次将更改推送到GitHub仓库后，Vercel会自动重新部署您的应用。您也可以在Vercel仪表板中手动触发新的部署。

## 本地开发提示

在本地开发时，创建`.env.local`文件并包含所有必要的环境变量：

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog"
JWT_SECRET="your-local-development-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

使用`npm run dev`启动本地开发服务器。 