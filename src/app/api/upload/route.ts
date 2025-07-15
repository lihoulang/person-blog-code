import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

// 验证用户身份
async function verifyUser(cookieStore: any) {
  try {
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT密钥未配置');
    
    const decoded = verify(token, secret) as any;
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    return user;
  } catch (error) {
    console.error('验证用户身份失败:', error);
    return null;
  }
}

// 处理POST请求 - 上传图片
export async function POST(request: Request) {
  try {
    // 验证用户身份
    const cookieStore = cookies();
    const user = await verifyUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未找到图片文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传JPEG、PNG、GIF或WEBP格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制，最大允许5MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const ext = file.name.split('.').pop();
    const fileName = `${hash}-${Date.now()}.${ext}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // 返回图片URL
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: '图片上传成功'
    });

  } catch (error) {
    console.error('图片上传失败:', error);
    return NextResponse.json(
      { error: '图片上传失败' },
      { status: 500 }
    );
  }
} 