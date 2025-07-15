import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 获取用户的关注列表
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // 验证用户ID
    if (!userId) {
      return NextResponse.json(
        { error: '缺少必要参数: userId' },
        { status: 400 }
      );
    }
    
    const targetUserId = parseInt(userId, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { error: '无效的用户ID' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
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
    
    // 获取关注总数
    const totalFollowing = await prisma.follow.count({
      where: { followerId: targetUserId }
    });
    
    // 获取关注列表
    const following = await prisma.follow.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    // 格式化关注数据
    const formattedFollowing = following.map(follow => ({
      id: follow.following.id.toString(),
      name: follow.following.name || '',
      email: follow.following.email,
      avatar: follow.following.avatar || '',
      bio: follow.following.bio || '',
      followedAt: follow.createdAt.toISOString(),
    }));
    
    return NextResponse.json({
      following: formattedFollowing,
      totalFollowing,
      page,
      limit,
      totalPages: Math.ceil(totalFollowing / limit),
    });
  } catch (error: any) {
    console.error('获取关注列表失败:', error);
    
    return NextResponse.json(
      { error: '获取关注列表失败' },
      { status: 500 }
    );
  }
} 