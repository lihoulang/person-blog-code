import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 获取文章点赞信息
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    
    // 验证文章ID
    if (!postId) {
      return NextResponse.json(
        { error: '缺少必要参数: postId' },
        { status: 400 }
      );
    }
    
    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json(
        { error: '无效的文章ID' },
        { status: 400 }
      );
    }
    
    // 获取文章点赞数
    const likesCount = await prisma.like.count({
      where: { postId: numericPostId },
    });
    
    // 检查当前用户是否已点赞
    let userLiked = false;
    
    // 获取当前用户ID（如果已登录）
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET) as { id: number };
        
        // 检查用户是否已点赞
        const existingLike = await prisma.like.findFirst({
          where: {
            postId: numericPostId,
            userId: decoded.id,
          },
        });
        
        userLiked = !!existingLike;
      } catch (error) {
        console.error('验证令牌失败:', error);
        // 不返回错误，只是将userLiked设为false
      }
    }
    
    return NextResponse.json({
      likesCount,
      userLiked,
    });
  } catch (error: any) {
    console.error('获取点赞信息失败:', error);
    
    return NextResponse.json(
      { error: '获取点赞信息失败' },
      { status: 500 }
    );
  }
}

// 添加或取消点赞
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
    const { postId, action } = body;

    // 验证参数
    if (!postId) {
      return NextResponse.json(
        { error: '缺少必要参数: postId' },
        { status: 400 }
      );
    }
    
    if (!action || (action !== 'like' && action !== 'unlike')) {
      return NextResponse.json(
        { error: '无效的操作: action必须为like或unlike' },
        { status: 400 }
      );
    }

    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json(
        { error: '无效的文章ID' },
        { status: 400 }
      );
    }

    // 检查文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: numericPostId },
    });

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 检查是否已经点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        postId: numericPostId,
      },
    });

    // 根据操作类型处理点赞/取消点赞
    if (action === 'like' && !existingLike) {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: numericPostId,
        },
      });
    } else if (action === 'unlike' && existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    }

    // 获取更新后的点赞数
    const likesCount = await prisma.like.count({
      where: { postId: numericPostId },
    });

    return NextResponse.json({
      message: action === 'like' ? '点赞成功' : '取消点赞成功',
      likesCount,
      userLiked: action === 'like',
    });
  } catch (error: any) {
    console.error('处理点赞请求失败:', error);
    
    return NextResponse.json(
      { error: '处理点赞请求失败' },
      { status: 500 }
    );
  }
} 