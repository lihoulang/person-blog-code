import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 验证用户身份和权限
async function verifyUser(cookieStore: any) {
  try {
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT密钥未配置');
    
    const decoded = verify(token, secret) as any;
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    return user;
  } catch (error) {
    console.error('验证用户身份失败:', error);
    return null;
  }
}

// 处理POST请求 - 创建新文章
export async function POST(request: Request) {
  try {
    // 验证用户身份
    const cookieStore = cookies();
    const user = await verifyUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求数据
    const { title, description, content, tags } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容为必填项' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // 检查slug是否已存在
    let existingPost = await prisma.post.findUnique({ where: { slug } });
    while (existingPost) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      existingPost = await prisma.post.findUnique({ where: { slug } });
    }

    // 1. 保存到PostgreSQL数据库
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        description: description || title,
        published: true,  // 默认发布
        author: {
          connect: { id: user.id }
        },
        // 处理标签
        tags: tags && tags.length > 0
          ? {
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag }
              }))
            }
          : undefined
      },
      include: {
        author: {
          select: {
            name: true
          }
        },
        tags: true
      }
    });

    // 2. 尝试保存到文件系统 (可选，如果失败不影响主功能)
    let fileSystemSuccess = true;
    try {
      const postsDirectory = path.join(process.cwd(), 'content/posts');
      
      // 确保目录存在
      if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true });
      }
      
      const mdxContent = `---
title: ${title}
description: ${description || ''}
date: ${new Date().toISOString()}
tags: [${tags ? tags.join(', ') : ''}]
author: ${user.name || 'Anonymous'}
---

${content}`;

      const filePath = path.join(postsDirectory, `${slug}.mdx`);
      fs.writeFileSync(filePath, mdxContent, 'utf8');
    } catch (fsError) {
      console.error('保存到文件系统失败:', fsError);
      fileSystemSuccess = false;
    }

    return NextResponse.json({
      success: true,
      post,
      fileSystemSuccess,
      message: fileSystemSuccess 
        ? '文章已成功保存到数据库并添加到文件系统' 
        : '文章已成功保存到数据库，但保存到文件系统失败'
    });

  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
} 