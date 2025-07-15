import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { prisma } from './prisma';
import { Post } from '@/types/post';

const postsDirectory = path.join(process.cwd(), 'content/posts');

// 从文件系统获取所有文章
export async function getAllPosts(): Promise<Post[]> {
  try {
    // 尝试从数据库获取文章
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

    if (dbPosts.length > 0) {
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
    }

    // 如果数据库中没有文章，则从文件系统读取
    if (!fs.existsSync(postsDirectory)) {
      return [];
  }
  
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
          id: slug,
          slug,
          content,
          title: data.title || slug,
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: data.description || '',
          tags: data.tags || [],
          author: data.author || 'Anonymous',
          viewCount: 0
        };
      });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

// 根据Slug获取文章
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // 尝试从数据库获取文章
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

    if (dbPost) {
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
    }

    // 如果数据库中没有文章，则从文件系统读取
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      const mdPath = path.join(postsDirectory, `${slug}.md`);
      if (!fs.existsSync(mdPath)) {
        return null;
      }
      
      const fileContents = fs.readFileSync(mdPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // 将Markdown转换为HTML
      const processedContent = await remark()
        .use(html)
        .process(content);
      const contentHtml = processedContent.toString();
      
      return {
        id: slug,
        slug,
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: data.description || '',
        content: contentHtml,
        tags: data.tags || [],
        author: data.author || 'Anonymous',
        viewCount: 0
      };
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 将Markdown转换为HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();
    
    return {
      id: slug,
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: data.description || '',
      content: contentHtml,
      tags: data.tags || [],
      author: data.author || 'Anonymous',
      viewCount: 0
    };
  } catch (error) {
    console.error(`获取文章 ${slug} 失败:`, error);
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
    // 尝试从数据库获取标签
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

    if (dbTags.length > 0) {
      return dbTags.map((tag) => ({
        name: tag.name,
        count: tag._count.posts,
      }));
    }

    // 如果数据库中没有标签，则从文件系统读取
    const posts = await getAllPosts();
    const tagCounts: { [key: string]: number } = {};
  
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
      if (tagCounts[tag]) {
            tagCounts[tag]++;
      } else {
            tagCounts[tag] = 1;
      }
        });
      }
    });

    return Object.keys(tagCounts)
      .map((tag) => ({
        name: tag,
        count: tagCounts[tag],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('获取标签失败:', error);
    return [];
  }
}

// 获取相关文章
export async function getRelatedPosts(post: Post, limit: number = 3): Promise<Post[]> {
  if (!post || !post.tags || post.tags.length === 0) {
    return [];
  }

  try {
    // 尝试从数据库获取相关文章
    const relatedDbPosts = await prisma.post.findMany({
      where: {
        slug: { not: post.slug },
        published: true,
        tags: {
          some: {
            name: {
              in: post.tags,
            },
          },
        },
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

    if (relatedDbPosts.length > 0) {
      return relatedDbPosts.map((post) => ({
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
    }

    // 如果数据库中没有相关文章，则从文件系统获取
    const allPosts = await getAllPosts();
    
    // 过滤掉当前文章
    const otherPosts = allPosts.filter((p) => p.slug !== post.slug);
    
    // 根据标签匹配度排序
    return otherPosts
      .map((p) => {
        const matchingTags = post.tags.filter((tag) => p.tags?.includes(tag)).length;
        return { ...p, matchScore: matchingTags };
      })
      .filter((p) => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('获取相关文章失败:', error);
    return [];
  }
} 