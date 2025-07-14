#!/bin/bash

# 生成Prisma客户端
echo "Generating Prisma client..."
npx prisma generate

# 运行Next.js构建
echo "Running Next.js build..."
next build 