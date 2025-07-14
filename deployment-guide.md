# 个人博客部署指南

## 一、PlanetScale数据库设置

### PlanetScale基本信息
- 网址：https://planetscale.com/
- 免费计划内容：1个数据库、5GB存储、每月10亿次读取、每月1000万次写入

### PlanetScale数据库设置步骤
1. 注册PlanetScale账号：
   ```
   https://planetscale.com/sign-up
   ```
   
2. 创建数据库：
   - 登录后点击"New database"
   - 数据库名称：personal-blog
   - 选择区域：ap-northeast(东京)或其他靠近您的区域
   - 选择Hobby(免费)计划

3. 创建数据库架构：
   - 主分支(`main`)将自动创建
   - 使用Web控制台或CLI连接并创建表结构

4. 生成数据库凭证：
   - 在数据库页面点击"Connect"
   - 选择"Prisma"连接方式
   - 生成新的密码
   - 保存生成的连接字符串(`DATABASE_URL`)

## 二、Vercel部署配置

### Vercel基本信息
- 网址：https://vercel.com/
- 已部署项目：https://person-blog-hblaifkb6-lihl.vercel.app
- 项目仪表盘：https://vercel.com/lihl/person-blog

### 环境变量设置
1. 进入项目设置页面：
   - 点击项目
   - 选择"Settings" > "Environment Variables"

2. 添加以下环境变量：
   ```
   DATABASE_URL = mysql://<USERNAME>:<PASSWORD>@<HOST>/<DATABASE>?sslaccept=strict
   JWT_SECRET = your-production-jwt-secret-key-change-this
   ```

3. 保存并重新部署项目：
   ```
   vercel --prod
   ```

## 三、解决无法访问网站的问题

### 问题原因分析
目前网站显示"无法访问此网站"(ERR_CONNECTION_CLOSED)，主要原因有：

1. **数据库连接问题**：
   - 本地数据库URL(`localhost`)在云端无效
   - 缺少必要的环境变量
   - 数据库凭证不正确

2. **应用配置问题**：
   - Flexsearch库导入方式有误
   - 搜索API路由配置有问题

### 解决方案

#### 1. 创建和配置PlanetScale云数据库
```bash
# 注册并登录PlanetScale
# 创建数据库和所需表
# 获取连接字符串
```

#### 2. 更新Vercel环境变量
在Vercel项目设置中添加正确的环境变量：
```
# 数据库连接URL - 使用PlanetScale提供的连接字符串
DATABASE_URL = mysql://<USERNAME>:<PASSWORD>@<HOST>/personal_blog?sslaccept=strict

# JWT密钥 - 生产环境使用强随机密钥
JWT_SECRET = your-production-jwt-secret-key-change-this
```

#### 3. 修复应用代码问题
1. **修复Flexsearch导入问题**：
   ```javascript
   // 使用正确的Flexsearch导入方式
   const FlexSearch = require('flexsearch');
   ```

2. **确保API路由正确配置**：
   ```javascript
   // 确保搜索API使用动态渲染
   export const dynamic = 'force-dynamic';
   ```

3. **处理登录跳转问题**：
   ```javascript
   // 确保登录成功后跳转到主页
   window.location.href = '/';
   ```

#### 4. 重新部署应用
```bash
# 提交更改
git add .
git commit -m "修复数据库连接和应用问题"

# 部署到Vercel
vercel --prod
```

## 四、项目更新与维护

### 代码更新流程
1. 本地修改代码
2. 提交到Git仓库
```bash
git add .
git commit -m "更新描述"
git push
```

3. Vercel会自动部署最新代码，或手动部署：
```bash
vercel --prod
```

### 数据库维护
- **监控数据库使用情况**：在PlanetScale仪表盘查看存储和查询使用量
- **备份数据**：定期导出重要数据
- **优化查询**：使用PlanetScale提供的查询分析工具优化性能

### 常见问题排查
- **部署失败**：检查Vercel构建日志
- **数据库连接失败**：验证连接字符串和网络访问权限
- **应用性能问题**：使用Vercel Analytics和PlanetScale监控工具分析性能 