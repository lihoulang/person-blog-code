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

// 获取单篇文章
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { error: '获取文章详情失败' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 });
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    const { title, content, description, slug, published, tags } = await req.json();

    // 如果更新slug，检查是否与其他文章冲突
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: '该slug已被使用，请使用其他slug' },
          { status: 400 }
        );
      }
    }

    // 更新文章
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        description: description !== undefined ? description : undefined,
        slug: slug !== undefined ? slug : undefined,
        published: published !== undefined ? published : undefined,
        tags: tags !== undefined
          ? {
              // 先断开所有现有标签连接
              set: [],
              // 然后连接或创建新标签
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: '没有权限访问' }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 });
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 删除文章
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: '文章已成功删除' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
} 