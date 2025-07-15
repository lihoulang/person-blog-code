import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET环境变量未设置');
      return NextResponse.json(
        { error: '服务器配置错误: JWT密钥未配置' },
        { status: 500 }
      );
    }

    // 从cookie中获取令牌
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    // 如果没有令牌，返回未授权错误
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证令牌
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = verify(token, jwtSecret) as { id: number };

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    // 如果未找到用户，返回未授权错误
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { postId } = body;

    // 验证文章ID
    if (!postId) {
      return NextResponse.json(
        { error: '缺少必要参数: postId' },
        { status: 400 }
      );
    }

    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 检查是否已经收藏过
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        postId: parseInt(postId),
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: '已经收藏过此文章' },
        { status: 400 }
      );
    }

    // 创建收藏
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        postId: parseInt(postId),
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '收藏成功',
      bookmark: {
        id: bookmark.id.toString(),
        postId: bookmark.postId.toString(),
        createdAt: bookmark.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('添加收藏失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '添加收藏失败';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 