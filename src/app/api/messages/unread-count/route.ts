import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 计算未读消息数量
    const count = await prisma.message.count({
      where: {
        receiverId: parseInt(userId.toString()),
        isRead: false
      }
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    return NextResponse.json({ error: '获取未读消息数量失败' }, { status: 500 });
  }
} 