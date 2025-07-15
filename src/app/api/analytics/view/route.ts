import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 处理文章阅读统计的API路由
 * POST /api/analytics/view
 */
export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();
    
    if (!postId) {
      return NextResponse.json(
        { error: '缺少文章ID参数' },
        { status: 400 }
      );
    }
    
    // 更新文章的总阅读计数
    await prisma.post.update({
      where: { id: Number(postId) },
      data: { viewCount: { increment: 1 } }
    });
    
    // 暂时注释掉PostView创建，等数据库迁移完成后再启用
    /*
    // 获取请求信息
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || 'direct';
    
    await prisma.postView.create({
      data: {
        postId: Number(postId),
        ip: String(ip),
        userAgent,
        referrer
      }
    });
    */
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('记录文章阅读失败:', error);
    return NextResponse.json(
      { error: '记录文章阅读失败' },
      { status: 500 }
    );
  }
} 