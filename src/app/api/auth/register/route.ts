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

    const { name, email, password } = await req.json();

    // 验证请求数据
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '姓名、邮箱和密码是必填项' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 创建JWT
    const jwtSecret = process.env.JWT_SECRET;
    
    // 生成令牌
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name 
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
      message: '注册成功',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('注册失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '注册失败，请稍后重试';
    
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
