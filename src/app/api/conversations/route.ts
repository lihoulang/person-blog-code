import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Conversation, CreateConversationRequest } from '@/types/chat';

// 获取当前用户的所有对话
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 查询包含当前用户的所有对话
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId.toString(),
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // 获取对话中的其他用户信息和未读消息计数
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conversation) => {
        // 找出对话中的另一个用户ID
        const otherUserId = conversation.participantIds.find(id => id !== userId.toString());
        
        if (!otherUserId) return conversation;
        
        // 获取另一个用户的信息
        const otherUser = await prisma.user.findUnique({
          where: { id: parseInt(otherUserId) },
          select: {
            id: true,
            name: true,
            avatar: true
          }
        });
        
        // 计算未读消息数量
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            receiverId: parseInt(userId.toString()),
            isRead: false
          }
        });
        
        return {
          ...conversation,
          lastMessage: conversation.messages[0] || null,
          messages: undefined, // 移除原始消息数组
          unreadCount,
          otherUser: otherUser ? {
            id: otherUser.id.toString(),
            name: otherUser.name,
            avatar: otherUser.avatar
          } : undefined
        };
      })
    );
    
    return NextResponse.json({ conversations: conversationsWithUsers });
  } catch (error) {
    console.error('获取对话列表失败:', error);
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 });
  }
}

// 创建新对话
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    
    // 解析请求体
    const body = await request.json() as CreateConversationRequest;
    const { userId: otherUserId } = body;
    
    if (!otherUserId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    // 确保两个用户ID存在
    const otherUserExists = await prisma.user.findUnique({
      where: { id: parseInt(otherUserId) }
    });
    
    if (!otherUserExists) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    // 检查对话是否已存在
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: userId.toString() } },
          { participantIds: { has: otherUserId } }
        ]
      }
    });
    
    if (existingConversation) {
      return NextResponse.json({ 
        conversation: existingConversation,
        existed: true
      });
    }
    
    // 创建新对话
    const newConversation = await prisma.conversation.create({
      data: {
        participantIds: [userId.toString(), otherUserId],
        lastMessageAt: new Date(),
      }
    });
    
    return NextResponse.json({ 
      conversation: newConversation,
      existed: false
    });
  } catch (error) {
    console.error('创建对话失败:', error);
    return NextResponse.json({ error: '创建对话失败' }, { status: 500 });
  }
} 
 
 