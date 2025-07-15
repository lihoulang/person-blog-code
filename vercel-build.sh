#!/bin/bash

# 执行 Next.js 构建
echo "🚀 开始构建..."
npm run build

# 执行 Prisma 数据库迁移
echo "🔄 同步数据库结构..."
npx prisma db push

echo "✅ 构建和数据库同步完成!" 