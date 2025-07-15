import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { User } from '@prisma/client';

// 强制动态路由
export const dynamic = 'force-dynamic';

// 用户类型定义
type UserWithRole = User & {
  role?: string;
};

// 获取当前用户
async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;
    
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT密钥未配置');
    
    const decoded = verify(token, secret) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) return null;
    
    // 添加角色信息
    return {
      ...user,
      role: decoded.role || 'user'
    };
  } catch (error) {
    console.error('验证用户失败:', error);
    return null;
  }
}

// 格式化评论类型
interface FormattedComment {
  id: number;
  content: string;
  createdAt: string;
  author?: {
    id: number;
    name: string | null;
  };
  guestName: string | null;
  guestEmail: string | null;
  parentId: number | null;
  replies?: FormattedComment[];
}

// 构建评论层次结构
function buildCommentHierarchy(comments: FormattedComment[]): FormattedComment[] {
  const commentMap = new Map<number, FormattedComment>();
  const rootComments: FormattedComment[] = [];
  
  // 创建所有评论的映射
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: []
    });
  });
  
  // 构建层次结构
  comments.forEach(comment => {
    if (comment.parentId) {
      // 这是一个回复评论
      const parentComment = commentMap.get(comment.parentId);
      if (parentComment) {
        parentComment.replies!.push(commentMap.get(comment.id)!);
      } else {
        // 如果找不到父评论，将其作为根评论处理
        rootComments.push(commentMap.get(comment.id)!);
      }
    } else {
      // 这是一个根评论
      rootComments.push(commentMap.get(comment.id)!);
    }
  });
  
  return rootComments;
}

// GET 处理程序 - 获取评论
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const slug = searchParams.get('slug');
    const hierarchyParam = searchParams.get('hierarchy');
    const wantHierarchy = hierarchyParam === 'true';
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    if (!postId && !slug) {
      return NextResponse.json(
        { error: '必须提供postId或slug参数' },
        { status: 400 }
      );
    }
    
    // 查询条件
    const where: any = {};
    if (postId) {
      where.postId = parseInt(postId, 10);
    } else if (slug) {
      where.post = { slug };
    }
    
    // 只查询根评论（不是回复）用于分页
    if (!wantHierarchy) {
      where.parentId = null;
    }
    
    // 添加已批准条件
    where.isApproved = true;
    
    // 获取评论总数（用于分页信息）
    const totalCount = await prisma.comment.count({
      where
    });
    
    // 获取评论，包括作者信息和父评论ID
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: wantHierarchy ? 0 : skip, // 如果需要层次结构，不使用分页
      take: wantHierarchy ? undefined : limit, // 如果需要层次结构，获取所有评论
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // 如果需要层次结构，还需要获取所有回复
    let allComments = comments;
    if (wantHierarchy) {
      // 获取所有评论的ID
      const commentIds = comments.map(comment => comment.id);
      
      // 获取所有回复
      const replies = await prisma.comment.findMany({
        where: {
          parentId: { in: commentIds },
          isApproved: true
        },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      // 合并根评论和回复
      allComments = [...comments, ...replies];
    }
    
    // 转换评论格式
    const formattedComments: FormattedComment[] = allComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author ? {
        id: comment.author.id,
        name: comment.author.name
      } : undefined,
      guestName: comment.guestName,
      guestEmail: comment.guestEmail,
      parentId: comment.parentId
    }));
    
    // 如果需要层次结构
    if (wantHierarchy) {
      const hierarchicalComments = buildCommentHierarchy(formattedComments);
      return NextResponse.json(hierarchicalComments);
    }
    
    // 返回分页信息
    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// POST 处理程序 - 创建评论
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // 验证必需字段
    const { postId, content, parentId } = body;
    
    if (!postId) {
      return NextResponse.json(
        { error: '缺少必需字段: postId' },
        { status: 400 }
      );
    }
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      );
    }
    
    // 准备评论数据
    const commentData: any = {
      content,
      postId: parseInt(postId, 10),
      isApproved: user?.role === 'admin', // 管理员评论自动批准
    };
    
    // 设置父评论ID（如果有）
    if (parentId) {
      commentData.parentId = parseInt(parentId, 10);
    }
    
    // 设置作者信息
    if (user) {
      commentData.authorId = user.id;
    } else {
      // 游客评论
      const { guestName, guestEmail } = body;
      
      if (!guestName || guestName.trim() === '') {
        return NextResponse.json(
          { error: '游客评论需要提供名字' },
          { status: 400 }
        );
      }
      
      commentData.guestName = guestName;
      commentData.guestEmail = guestEmail;
    }
    
    // 创建评论
    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // 格式化响应
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author ? {
        id: comment.author.id,
        name: comment.author.name
      } : undefined,
      guestName: comment.guestName,
      guestEmail: comment.guestEmail,
      parentId: comment.parentId,
      isApproved: comment.isApproved
    };
    
    return NextResponse.json({
      comment: formattedComment,
      message: comment.isApproved ? '评论已发布' : '评论已提交，等待审核'
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    );
  }
} 