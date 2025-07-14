import { prisma } from './prisma'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

// 生成或获取访客ID
export async function getVisitorId(): Promise<string> {
  const cookieStore = cookies()
  let visitorId = cookieStore.get('visitor_id')?.value
  
  // 如果不存在访客ID，创建一个新的
  if (!visitorId) {
    visitorId = uuidv4()
    
    // 创建一个长期保存的cookie (180天)
    // 注意：实际使用时，你可能需要处理用户同意Cookie的逻辑
  }
  
  return visitorId
}

// 记录文章阅读
export async function recordPostView(postId: number | string, visitorId: string): Promise<void> {
  try {
    // 确保postId是有效的数字
    const postIdNum = typeof postId === 'string' ? parseInt(postId, 10) : postId
    
    if (isNaN(postIdNum)) {
      throw new Error(`Invalid postId: ${postId}`);
    }
    
    // 更新文章阅读量
    await prisma.post.update({
      where: { id: postIdNum },
      data: {
        viewCount: { increment: 1 }
      }
    })
    
    // 这里可以添加更详细的分析逻辑，如记录访问者信息、来源等
    console.log(`记录文章访问: 文章ID=${postIdNum}, 访客ID=${visitorId}`)
  } catch (error) {
    console.error('记录文章阅读失败:', error)
    // 不要让分析错误影响用户体验
  }
}

// 获取热门文章
export async function getPopularPosts(limit: number = 5): Promise<any[]> {
  try {
    const popularPosts = await prisma.post.findMany({
      where: {
        published: true
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        viewCount: true,
        createdAt: true
      }
    })
    
    return popularPosts
  } catch (error) {
    console.error('获取热门文章失败:', error)
    return []
  }
}

// 获取文章统计
export async function getPostsStats(): Promise<{
  totalPosts: number,
  totalViews: number,
  avgViewsPerPost: number
}> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true
      },
      select: {
        viewCount: true
      }
    })
    
    const totalPosts = posts.length
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0
    
    return {
      totalPosts,
      totalViews,
      avgViewsPerPost
    }
  } catch (error) {
    console.error('获取文章统计失败:', error)
    return {
      totalPosts: 0,
      totalViews: 0,
      avgViewsPerPost: 0
    }
  }
} 