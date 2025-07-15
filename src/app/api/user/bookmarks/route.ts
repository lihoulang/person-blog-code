import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

export async function GET() {
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

    // 获取用户的收藏
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            coverImage: true,
            createdAt: true,
            viewCount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 格式化收藏数据
    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id.toString(),
      postId: bookmark.postId.toString(),
      createdAt: bookmark.createdAt.toISOString(),
      post: {
        id: bookmark.post.id.toString(),
        title: bookmark.post.title,
        slug: bookmark.post.slug,
        description: bookmark.post.description || '',
        coverImage: bookmark.post.coverImage || null,
        date: bookmark.post.createdAt.toISOString(),
        viewCount: bookmark.post.viewCount,
      },
    }));

    return NextResponse.json({
      bookmarks: formattedBookmarks,
    });
  } catch (error: any) {
    console.error('获取用户收藏失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '获取收藏失败';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 