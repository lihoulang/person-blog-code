import { prisma } from './prisma';

/**
 * 获取特定文章的阅读统计数据
 */
export async function getPostViewStats(postId: number) {
  // 获取文章总阅读量
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { viewCount: true }
  });
  
  const totalViews = post?.viewCount || 0;
  
  // 暂时返回简化版统计数据，等PostView模型迁移完成后再实现完整统计
  return {
    totalViews,
    dailyViews: [],
    referrerStats: []
  };
}

/**
 * 获取所有文章的总阅读统计数据
 */
export async function getTotalViewStats() {
  // 获取总阅读量
  const totalViewsResult = await prisma.post.aggregate({
    _sum: { viewCount: true }
  });
  
  const totalViews = totalViewsResult._sum.viewCount || 0;
  
  // 获取阅读量最高的文章
  const topPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true
    },
    orderBy: { viewCount: 'desc' },
    take: 10
  });
  
  // 暂时返回简化版趋势数据
  return {
    totalViews,
    topPosts,
    dailyViewTrend: []
  };
}

/**
 * 获取阅读量增长统计
 */
export async function getViewGrowthStats() {
  // 简化版增长统计，基于现有的viewCount字段
  const posts = await prisma.post.findMany({
    select: {
      viewCount: true,
      updatedAt: true
    }
  });
  
  // 按月份分组文章
  const currentDate = new Date();
  const oneMonthAgo = new Date(currentDate);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // 简单估算本月和上月的阅读量
  const currentMonthViews = posts.reduce((sum, post) => {
    if (post.updatedAt >= oneMonthAgo) {
      return sum + post.viewCount;
    }
    return sum;
  }, 0);
  
  const previousMonthViews = posts.reduce((sum, post) => {
    if (post.updatedAt < oneMonthAgo) {
      return sum + post.viewCount;
    }
    return sum;
  }, 0);
  
  // 计算增长率
  const growthRate = previousMonthViews === 0 
    ? 100 
    : ((currentMonthViews - previousMonthViews) / previousMonthViews) * 100;
  
  return {
    currentMonthViews,
    previousMonthViews,
    growthRate: parseFloat(growthRate.toFixed(2))
  };
} 