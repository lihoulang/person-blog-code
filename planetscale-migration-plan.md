# PlanetScale数据库迁移计划

## 1. 创建PlanetScale账户
- 访问 https://planetscale.com/sign-up 注册账户
- 选择"Continue with GitHub"以简化注册流程

## 2. 创建新数据库
- 登录PlanetScale后，点击"New Database"
- 数据库名称：`personal-blog`
- 选择离您最近的区域，例如：`ap-northeast` (东京)
- 选择免费计划（Hobby Plan）

## 3. 数据库架构
我们将创建以下表结构：

```sql
-- 用户表
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  published BOOLEAN DEFAULT false,
  authorId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id)
);

-- 标签表
CREATE TABLE tags (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章标签关联表
CREATE TABLE post_tags (
  postId VARCHAR(255) NOT NULL,
  tagId VARCHAR(255) NOT NULL,
  PRIMARY KEY (postId, tagId),
  FOREIGN KEY (postId) REFERENCES posts(id),
  FOREIGN KEY (tagId) REFERENCES tags(id)
);
```

## 4. 设置数据库凭证
- 在PlanetScale数据库详情页面，点击"Connect"
- 选择"Prisma"连接方式
- 生成新的数据库密码
- 复制生成的连接字符串

## 5. Vercel环境变量设置
- 在Vercel项目设置中，添加以下环境变量：
  - `DATABASE_URL`: 从PlanetScale复制的连接字符串
  - `JWT_SECRET`: 自定义安全密钥

## 6. 数据迁移
当本地开发环境与PlanetScale数据库连接后，使用Prisma执行数据库迁移：

```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 将迁移应用到PlanetScale
npx prisma db push

# 生成Prisma客户端
npx prisma generate
```

## 7. 数据库连接测试
在应用中创建一个API路由用于测试数据库连接：

```javascript
// pages/api/test-db.js
import { PrismaClient } from '@prisma/client'

export default async function handler(req, res) {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany()
    res.status(200).json({ message: "Database connection successful", users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
``` 