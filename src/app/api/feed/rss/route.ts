import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { generateRssFeed } from '@/lib/rss';

/**
 * 提供RSS feed的API端点
 * GET /api/feed/rss
 */
export async function GET() {
  try {
    // 获取所有已发布的文章
    const allPosts = await getAllPosts();
    
    // 按发布日期降序排序
    const sortedPosts = allPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // 只取最新的20篇文章
    const recentPosts = sortedPosts.slice(0, 20);
    
    // 获取网站基础URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // 生成RSS内容
    const rssContent = generateRssFeed(recentPosts, baseUrl);
    
    // 返回XML格式的响应
    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('生成RSS feed失败:', error);
    return NextResponse.json(
      { error: 'RSS生成失败' },
      { status: 500 }
    );
  }
} 