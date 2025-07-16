import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/search';
import { getAllPosts, getLatestPosts } from '@/lib/blog';

/**
 * 处理博客搜索请求的API路由
 * GET /api/blog/search
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const tag = url.searchParams.get('tag') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const sortBy = url.searchParams.get('sortBy') || 'relevance'; // relevance, date, views, comments
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // asc, desc
    const author = url.searchParams.get('author') || ''; // 新增：按作者过滤
    const readTime = url.searchParams.get('readTime') || ''; // 新增：按阅读时间过滤 (short, medium, long)
    const minComments = url.searchParams.get('minComments') || ''; // 新增：按最少评论数过滤
    
    if (!query && !tag && !dateFrom && !dateTo && !author && !readTime && !minComments) {
      // 推荐最新文章
      const recommended = await getLatestPosts(3);
      return NextResponse.json({ results: [], recommended });
    }
    
    // 执行搜索
    let results = query 
      ? await searchPosts(query)
      : await getAllPosts();
    
    // 获取完整的文章数据
    const allPosts = await getAllPosts();
    
    // 将搜索结果与完整的文章数据合并
    results = results.map(result => {
      // result 可能是 SearchablePost & { snippet } 或 Post
      const slug = (result as any).slug || (result as any).doc?.slug || '';
      const fullPost = allPosts.find(post => post.slug === slug) || {};
      // 合并所有字段，保证类型安全
      return {
        id: (fullPost as any).id || (result as any).id || '',
        title: (fullPost as any).title || (result as any).title || '',
        slug: slug,
        date: (fullPost as any).date || (result as any).date || '',
        content: (fullPost as any).content || (result as any).content || '',
        description: (fullPost as any).description || (result as any).description || '',
        tags: (fullPost as any).tags || (result as any).tags || [],
        author: (fullPost as any).author || (result as any).author || '',
        viewCount: (fullPost as any).viewCount || (result as any).viewCount || 0,
        coverImage: (fullPost as any).coverImage || (result as any).coverImage || '',
        snippet: (result as any).snippet || ''
      };
    });
    
    // 应用过滤条件
    if (tag) {
      results = results.filter(post => 
        post.tags && Array.isArray(post.tags) && 
        post.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
      );
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      results = results.filter(post => {
        const postDate = new Date(post.date);
        return postDate >= fromDate;
      });
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // 设置为当天最后一毫秒
      results = results.filter(post => {
        const postDate = new Date(post.date);
        return postDate <= toDate;
      });
    }
    
    // 新增：按作者过滤
    if (author) {
      results = results.filter(post => 
        post.author && post.author.name && 
        post.author.name.toLowerCase().includes(author.toLowerCase())
      );
    }
    
    // 新增：按阅读时间过滤
    if (readTime) {
      results = results.filter(post => {
        const wordCount = post.content ? post.content.split(/\s+/).length : 0;
        // 假设阅读速度为每分钟200字
        const estimatedMinutes = wordCount / 200;
        
        switch (readTime) {
          case 'short': // 短文 (少于5分钟)
            return estimatedMinutes < 5;
          case 'medium': // 中等 (5-15分钟)
            return estimatedMinutes >= 5 && estimatedMinutes <= 15;
          case 'long': // 长文 (超过15分钟)
            return estimatedMinutes > 15;
          default:
            return true;
        }
      });
    }
    
    // 新增：按最少评论数过滤
    if (minComments) {
      const minCommentsCount = parseInt(minComments, 10);
      if (!isNaN(minCommentsCount)) {
        results = results.filter(post => 
          (post.comments && post.comments.length >= minCommentsCount) ||
          (post._count && post._count.comments >= minCommentsCount)
        );
      }
    }
    
    // 应用排序
    if (sortBy === 'date') {
      results.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'views') {
      results.sort((a, b) => {
        const viewsA = a.viewCount || 0;
        const viewsB = b.viewCount || 0;
        return sortOrder === 'asc' ? viewsA - viewsB : viewsB - viewsA;
      });
    } else if (sortBy === 'comments') {
      // 新增：按评论数排序
      results.sort((a, b) => {
        const commentsA = (a.comments && a.comments.length) || (a._count && a._count.comments) || 0;
        const commentsB = (b.comments && b.comments.length) || (b._count && b._count.comments) || 0;
        return sortOrder === 'asc' ? commentsA - commentsB : commentsB - commentsA;
      });
    }
    
    // 记录搜索时间
    const timestamp = new Date().toISOString();
    // 若无结果，推荐最新文章
    let recommended = [];
    if (results.length === 0) {
      recommended = await getLatestPosts(3);
    }
    return NextResponse.json({
      results,
      recommended,
      meta: {
        count: results.length,
        query,
        filters: { tag, dateFrom, dateTo, author, readTime, minComments },
        sort: { sortBy, sortOrder },
        timestamp
      }
    });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { error: '搜索处理失败' },
      { status: 500 }
    );
  }
} 