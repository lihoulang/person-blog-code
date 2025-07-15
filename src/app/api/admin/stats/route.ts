import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 验证JWT令牌
async function verifyJwtToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT密钥未配置');
    }
    
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    // 验证用户是否已登录并且是管理员
    const token = req.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = await verifyJwtToken(token) as any;
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    // 获取各种统计数据
    const [
      postCount,
      commentCount,
      userCount,
      subscriberCount,
      tagCount,
      viewCountResult
    ] = await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.subscriber.count(),
      prisma.tag.count(),
      prisma.post.aggregate({
        _sum: {
          viewCount: true
        }
      })
    ]);

    // 计算总浏览量
    const viewCount = viewCountResult._sum.viewCount || 0;

    return NextResponse.json({
      postCount,
      commentCount,
      userCount,
      subscriberCount,
      tagCount,
      viewCount
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 