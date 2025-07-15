import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 获取用户资料和统计信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    
    // 验证用户ID
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: '无效的用户ID' },
        { status: 400 }
      );
    }
    
    // 获取用户资料
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    // 如果未找到用户，返回404错误
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 获取用户文章数量
    const postsCount = await prisma.post.count({
      where: { authorId: userId }
    });
    
    // 获取关注者数量
    const followersCount = await prisma.follow.count({
      where: { followingId: userId }
    });
    
    // 获取关注数量
    const followingCount = await prisma.follow.count({
      where: { followerId: userId }
    });
    
    // 格式化用户数据
    const formattedUser = {
      id: user.id.toString(),
      name: user.name || '',
      email: user.email,
      bio: user.bio || '',
      avatar: user.avatar || '',
      role: user.role || 'user',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
    
    return NextResponse.json({
      user: formattedUser,
      postsCount,
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    console.error('获取用户资料失败:', error);
    
    return NextResponse.json(
      { error: '获取用户资料失败' },
      { status: 500 }
    );
  }
} 