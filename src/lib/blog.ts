import { prisma } from './prisma';
import { Post } from '@/types/post';

// 从数据库获取所有文章
export async function getAllPosts(): Promise<Post[]> {
  try {
    // 从数据库获取文章
    const dbPosts = await prisma.post.findMany({
      where: { published: true },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return dbPosts.map((post) => ({
      id: String(post.id),
      title: post.title,
      date: post.createdAt.toISOString().split('T')[0],
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      tags: post.tags.map((tag) => tag.name),
      viewCount: post.viewCount,
      author: post.author?.name || 'Unknown',
    }));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

// 根据Slug获取文章
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    console.log(`开始从数据库获取文章, slug: ${slug}`);
    
    if (!slug) {
      console.error('获取文章失败: slug参数为空');
      return null;
    }
    
    // 从数据库获取文章
    const dbPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!dbPost) {
      console.log(`未找到文章: ${slug}`);
      return null;
    }

    console.log(`成功获取文章数据: ${dbPost.title} (ID: ${dbPost.id})`);
    
    return {
      id: String(dbPost.id),
      title: dbPost.title,
      date: dbPost.createdAt.toISOString().split('T')[0],
      slug: dbPost.slug,
      description: dbPost.description || '',
      content: dbPost.content,
      tags: dbPost.tags.map((tag) => tag.name),
      viewCount: dbPost.viewCount,
      author: dbPost.author?.name || 'Unknown',
    };
  } catch (error) {
    console.error(`获取文章 ${slug} 失败:`, error);
    // 返回堆栈信息以便调试
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return null;
  }
}

// 根据ID获取文章
export async function getPostById(id: number): Promise<Post | null> {
  try {
    // 从数据库获取文章
    const dbPost = await prisma.post.findUnique({
      where: { id },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!dbPost) {
      return null;
    }

    return {
      id: String(dbPost.id),
      title: dbPost.title,
      date: dbPost.createdAt.toISOString().split('T')[0],
      slug: dbPost.slug,
      description: dbPost.description || '',
      content: dbPost.content,
      tags: dbPost.tags.map((tag) => tag.name),
      viewCount: dbPost.viewCount,
      author: dbPost.author?.name || 'Unknown',
    };
  } catch (error) {
    console.error(`获取文章ID ${id} 失败:`, error);
    return null;
  }
}

// 获取所有标签
export async function getAllTags() {
  try {
    // 从数据库获取标签
    const dbTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return dbTags.map((tag) => ({
      name: tag.name,
      count: tag._count.posts,
    }));
  } catch (error) {
    console.error('获取标签失败:', error);
    return [];
  }
}

// 获取相关文章
export async function getRelatedPosts(post: Post, limit: number = 3): Promise<Post[]> {
  try {
    if (!post.tags || post.tags.length === 0) {
      // 如果文章没有标签，则获取最新的文章
      return getLatestPosts(limit, post.id);
    }

    // 查找具有相同标签的文章
    const relatedPosts = await prisma.post.findMany({
      where: {
        published: true,
        id: { not: parseInt(post.id) },
        tags: {
          some: {
            name: {
              in: post.tags
            }
          }
        }
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const formattedPosts = relatedPosts.map(post => ({
      id: String(post.id),
      title: post.title,
      date: post.createdAt.toISOString().split('T')[0],
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      tags: post.tags.map(tag => tag.name),
      viewCount: post.viewCount,
      author: post.author?.name || 'Unknown',
    }));

    // 如果相关文章不足，则补充最新文章
    if (formattedPosts.length < limit) {
      const latestPosts = await getLatestPosts(limit - formattedPosts.length, post.id);
      return [...formattedPosts, ...latestPosts];
    }

    return formattedPosts;
  } catch (error) {
    console.error('获取相关文章失败:', error);
    return [];
  }
}

// 获取最新文章
export async function getLatestPosts(limit: number = 3, excludeId?: string): Promise<Post[]> {
  try {
    const excludeIdNum = excludeId ? parseInt(excludeId) : undefined;

    const latestPosts = await prisma.post.findMany({
      where: {
        published: true,
        ...(excludeIdNum ? { id: { not: excludeIdNum } } : {})
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return latestPosts.map(post => ({
      id: String(post.id),
      title: post.title,
      date: post.createdAt.toISOString().split('T')[0],
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      tags: post.tags.map(tag => tag.name),
      viewCount: post.viewCount,
      author: post.author?.name || 'Unknown',
    }));
  } catch (error) {
    console.error('获取最新文章失败:', error);
    return [];
  }
}

// 按标签获取文章
export async function getPostsByTag(tag: string): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        tags: {
          some: {
            name: tag
          }
        }
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map(post => ({
      id: String(post.id),
      title: post.title,
      date: post.createdAt.toISOString().split('T')[0],
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      tags: post.tags.map(tag => tag.name),
      viewCount: post.viewCount,
      author: post.author?.name || 'Unknown',
    }));
  } catch (error) {
    console.error(`获取标签 ${tag} 的文章失败:`, error);
    return [];
  }
      title: post.title,
      date: post.createdAt.toISOString().split('T')[0],
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      tags: post.tags.map(tag => tag.name),
      viewCount: post.viewCount,
      author: post.author?.name || 'Unknown',
    }));
  } catch (error) {
    console.error(`获取标签 ${tag} 的文章失败:`, error);
    return [];
  }