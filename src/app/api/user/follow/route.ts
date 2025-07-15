import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 获取关注状态
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
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
    
    // 检查目标用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 获取当前用户ID（如果已登录）
    let currentUserId: number | null = null;
    let isFollowing = false;
    
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET) as { id: number };
        currentUserId = decoded.id;
        
        // 检查是否已关注
        if (currentUserId !== targetUserId) {
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUserId
              }
            }
          });
          
          isFollowing = !!follow;
        }
      } catch (error) {
        console.error('验证令牌失败:', error);
        // 不返回错误，只是将isFollowing设为false
      }
    }
    
    // 获取关注者和被关注者数量
    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId }
    });
    
    const followingCount = await prisma.follow.count({
      where: { followerId: targetUserId }
    });
    
    return NextResponse.json({
      isFollowing,
      followersCount,
      followingCount,
      currentUserId
    });
  } catch (error: any) {
    console.error('获取关注状态失败:', error);
    
    return NextResponse.json(
      { error: '获取关注状态失败' },
      { status: 500 }
    );
  }
}

// 关注或取消关注用户
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
    const currentUserId = decoded.id;

    // 获取用户信息
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    // 如果未找到用户，返回未授权错误
    if (!currentUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { userId, action } = body;

    // 验证参数
    if (!userId) {
      return NextResponse.json(
        { error: '缺少必要参数: userId' },
        { status: 400 }
      );
    }
    
    if (!action || (action !== 'follow' && action !== 'unfollow')) {
      return NextResponse.json(
        { error: '无效的操作: action必须为follow或unfollow' },
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
    
    // 不能关注自己
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: '不能关注自己' },
        { status: 400 }
      );
    }

    // 检查目标用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: '目标用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否已经关注
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    // 根据操作类型处理关注/取消关注
    if (action === 'follow' && !existingFollow) {
      // 添加关注
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
    } else if (action === 'unfollow' && existingFollow) {
      // 取消关注
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        },
      });
    }

    // 获取更新后的关注者数量
    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId }
    });

    return NextResponse.json({
      message: action === 'follow' ? '关注成功' : '取消关注成功',
      followersCount,
      isFollowing: action === 'follow',
    });
  } catch (error: any) {
    console.error('处理关注请求失败:', error);
    
    return NextResponse.json(
      { error: '处理关注请求失败' },
      { status: 500 }
    );
  }
} 