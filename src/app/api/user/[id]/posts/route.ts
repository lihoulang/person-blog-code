import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 获取用户的文章列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const userId = parseInt(params.id, 10);
    
    // 验证用户ID
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: '无效的用户ID' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 计算分页
    const skip = (page - 1) * limit;
    
    // 获取文章总数
    const totalPosts = await prisma.post.count({
      where: { 
        authorId: userId,
        published: true
      }
    });
    
    // 获取文章列表
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        published: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        createdAt: true,
        viewCount: true,
        tags: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    // 格式化文章数据
    const formattedPosts = posts.map(post => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      description: post.description || '',
      coverImage: post.coverImage || null,
      date: post.createdAt.toISOString(),
      viewCount: post.viewCount,
      tags: post.tags.map(tag => tag.name)
    }));
    
    return NextResponse.json({
      posts: formattedPosts,
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error: any) {
    console.error('获取用户文章失败:', error);
    
    return NextResponse.json(
      { error: '获取用户文章失败' },
      { status: 500 }
    );
  }
} 