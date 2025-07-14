import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// 验证JWT令牌
async function verifyJwtToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT密钥未配置');
    }
    
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

// 验证管理员权限
async function verifyAdmin(req: Request) {
  const token = req.headers.get('cookie')?.split(';')
    .find(c => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  if (!token) {
    return false;
  }

  const payload = await verifyJwtToken(token) as any;
  return payload && payload.role === 'admin';
}

export async function GET(req: Request) {
  try {
    // 验证管理员权限
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    // 获取查询参数
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter');
    const sort = url.searchParams.get('sort');
    const search = url.searchParams.get('search');

    // 构建查询条件
    const where: any = {};
    if (filter === 'published') {
      where.published = true;
    } else if (filter === 'draft') {
      where.published = false;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // 构建排序条件
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'views') {
      orderBy = { viewCount: 'desc' };
    }

    // 查询文章列表
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(req: Request) {
  try {
    // 验证管理员权限
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    const { title, content, description, slug, published, authorId, tags } = await req.json();

    // 验证必填字段
    if (!title || !content || !slug || !authorId) {
      return NextResponse.json(
        { error: '标题、内容、slug和作者ID是必填项' },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: '该slug已被使用，请使用其他slug' },
        { status: 400 }
      );
    }

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title,
        content,
        description,
        slug,
        published: published || false,
        author: {
          connect: { id: authorId },
        },
        tags: tags && tags.length > 0
          ? {
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
} 