import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: '819317636@qq.com' },
      update: {},
      create: {
        email: '819317636@qq.com',
        name: '管理员',
        password: hashedPassword,
      },
    });

    // 创建一些标签
    const tags = await Promise.all(
      ['技术', '生活', 'Web开发', 'React', 'Next.js'].map(async (name) => {
        return prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      })
    );

    // 创建一些文章
    const post1 = await prisma.post.upsert({
      where: { slug: 'hello-world' },
      update: {},
      create: {
        title: '你好，世界！',
        slug: 'hello-world',
        content: '这是我的第一篇博客文章。欢迎来到我的个人博客！',
        description: '我的第一篇博客文章',
        published: true,
        authorId: admin.id,
        viewCount: 10,
      },
    });

    await prisma.post.update({
      where: { id: post1.id },
      data: {
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }],
        },
      },
    });

    const post2 = await prisma.post.upsert({
      where: { slug: 'getting-started-with-nextjs' },
      update: {},
      create: {
        title: 'Next.js入门指南',
        slug: 'getting-started-with-nextjs',
        content: '本文将介绍如何开始使用Next.js构建现代化Web应用。\n\n## 什么是Next.js\n\nNext.js是一个React框架，它使得构建生产级别的React应用变得简单。它提供了服务端渲染、静态网站生成、TypeScript支持等众多功能。\n\n## 安装\n\n```bash\nnpm install next react react-dom\n```',
        description: '了解如何使用Next.js构建现代化Web应用',
        published: true,
        authorId: admin.id,
        viewCount: 25,
      },
    });

    await prisma.post.update({
      where: { id: post2.id },
      data: {
        tags: {
          connect: [{ id: tags[2].id }, { id: tags[3].id }, { id: tags[4].id }],
        },
      },
    });

    // 创建一些评论
    const comment1 = await prisma.comment.create({
      data: {
        content: '这是一篇很棒的文章！',
        postId: post1.id,
        authorId: admin.id,
        isApproved: true,
      },
    });

    const comment2 = await prisma.comment.create({
      data: {
        content: '非常感谢分享这些信息！',
        postId: post2.id,
        guestName: '访客用户',
        guestEmail: '819317636+guest@qq.com',
        isApproved: true,
      },
    });

    // 创建回复评论
    await prisma.comment.create({
      data: {
        content: '谢谢你的评论！',
        postId: post1.id,
        authorId: admin.id,
        parentId: comment1.id,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: '测试数据已创建',
      data: {
        admin,
        tags,
        posts: [post1, post2],
        comments: [comment1, comment2]
      }
    });

  } catch (error) {
    console.error('创建测试数据失败:', error);
    return NextResponse.json(
      { error: '创建测试数据失败', details: error },
      { status: 500 }
    );
  }
} 