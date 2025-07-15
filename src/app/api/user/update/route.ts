import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
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
    const { name, email, currentPassword, newPassword } = body;

    // 准备更新数据
    const updateData: any = {};
    
    // 更新名称（如果提供）
    if (name !== undefined && name !== user.name) {
      updateData.name = name;
    }
    
    // 更新邮箱（如果提供且不同）
    if (email !== undefined && email !== user.email) {
      // 检查邮箱是否已被使用
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: '该邮箱已被使用' },
          { status: 400 }
        );
      }
      
      updateData.email = email;
    }
    
    // 更新密码（如果提供）
    if (currentPassword && newPassword) {
      // 验证当前密码
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '当前密码不正确' },
          { status: 400 }
        );
      }
      
      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }
    
    // 如果没有要更新的数据，直接返回成功
    if (Object.keys(updateData).length === 0) {
      const { password: _password, ...userWithoutPassword } = user;
      return NextResponse.json({
        message: '资料未变更',
        user: userWithoutPassword
      });
    }
    
    // 更新用户资料
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
    
    // 返回更新后的用户数据（不包含密码）
    const { password: _password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: '资料更新成功',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('更新用户资料失败:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error.message || '更新资料失败';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 