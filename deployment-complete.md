# Vercel部署核心步骤

## 准备工作

1. **GitHub仓库**: 确保代码已推送到GitHub
2. **Vercel账户**: 使用GitHub账户登录Vercel
3. **项目配置**: 确认next.config.js不包含静态导出设置

## 部署流程

1. **登录Vercel**: https://vercel.com
2. **导入项目**: 
   - 点击"Add New..." > "Project"
   - 选择您的GitHub仓库
   - 点击"Import"

3. **配置设置**:
   - 指定根目录: `person-blog-code`
   - 保留默认构建设置
   - 添加环境变量:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_BASE_URL`

4. **开始部署**: 点击"Deploy"按钮

5. **设置数据库**:
   - 在项目仪表板中点击"Storage" > "Connect Store"
   - 选择"Postgres" > "Create New"
   - 选择区域和计划
   - 点击"Create"

6. **初始化数据库**:
   - 在部署详情页面打开控制台
   - 运行: `npx prisma migrate deploy`

7. **验证部署**:
   - 点击"Visit"访问您的应用
   - 测试各项功能是否正常工作

## 可能的问题和解决方案

### 部署失败
- 检查构建日志
- 确认环境变量设置正确

### 数据库连接问题
- 验证数据库URL格式
- 确认数据库服务正常运行

### 应用功能不正常
- 检查服务器日志
- 确认数据库迁移是否成功

## 持续更新

每次推送代码到GitHub仓库，Vercel会自动重新部署您的应用。

## 本地开发环境

```bash
# 创建.env.local文件
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog"
JWT_SECRET="your-dev-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 启动开发服务器
npm run dev
``` 