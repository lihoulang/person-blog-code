import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
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

    const { email, password } = await req.json();

    // 验证请求数据
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码是必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 检查用户是否存在
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 创建JWT
    const jwtSecret = process.env.JWT_SECRET;

    // 获取用户角色，Prisma模型中可能有role字段
    const userRole = 'role' in user ? (user as any).role : 'user';

    // 生成令牌，添加用户角色字段
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: userRole // 使用获取的角色或默认为'user'
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 设置cookie
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });

    // 返回用户数据（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: '登录成功',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('登录失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '登录失败，请稍后重试';
    
    // 检查是否是Prisma错误
    if (error.code) {
      console.error('Prisma错误代码:', error.code);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
