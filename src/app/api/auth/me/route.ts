import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL环境变量未设置');
      return NextResponse.json(
        { error: '服务器配置错误: 数据库连接未配置' },
        { status: 500 }
      );
    }

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

    // 解析令牌
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

    // 返回用户数据（不包含密码）
    const { password: _password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('验证用户失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '验证失败，请重新登录';
    
    // 检查是否是Prisma错误
    if (error.code) {
      console.error('Prisma错误代码:', error.code);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
