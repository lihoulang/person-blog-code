import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    
    // 查询文章作者
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { authorId: true }
    });
    
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ authorId: post.authorId });
  } catch (error) {
    console.error('获取文章作者失败:', error);
    return NextResponse.json({ error: '获取文章作者失败' }, { status: 500 });
  }
} 