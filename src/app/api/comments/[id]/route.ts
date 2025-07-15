import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id);
    
    // 验证评论ID
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: '无效的评论ID' },
        { status: 400 }
      );
    }
    
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
    const decoded = verify(token, jwtSecret) as { id: number; role?: string };

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

    // 获取评论信息
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    // 如果未找到评论，返回404错误
    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }

    // 验证权限（只有评论作者或管理员可以删除评论）
    const isAdmin = user.role === 'admin';
    const isAuthor = comment.authorId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: '没有权限删除此评论' },
        { status: 403 }
      );
    }

    // 删除评论
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      message: '评论已删除',
    });
  } catch (error: any) {
    console.error('删除评论失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '删除评论失败';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
 
 
 