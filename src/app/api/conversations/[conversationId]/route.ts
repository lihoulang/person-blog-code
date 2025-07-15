import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    // 验证用户身份
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const conversationId = params.conversationId;
    
    // 获取对话
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) }
    });
    
    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 });
    }
    
    // 检查用户是否是对话参与者
    if (!conversation.participantIds.includes(userId.toString())) {
      return NextResponse.json({ error: '无权访问此对话' }, { status: 403 });
    }
    
    // 获取对话中的其他用户
    const otherUserId = conversation.participantIds.find(id => id !== userId.toString());
    
    let otherUser = null;
    if (otherUserId) {
      // 获取其他用户信息
      otherUser = await prisma.user.findUnique({
        where: { id: parseInt(otherUserId) },
        select: {
          id: true,
          name: true,
          avatar: true
        }
      });
    }
    
    // 获取最后一条消息
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { createdAt: 'desc' }
    });
    
    // 格式化对话数据
    const formattedConversation = {
      ...conversation,
      otherUser: otherUser ? {
        id: otherUser.id.toString(),
        name: otherUser.name,
        avatar: otherUser.avatar
      } : null,
      lastMessage: lastMessage ? {
        id: lastMessage.id.toString(),
        content: lastMessage.content,
        createdAt: lastMessage.createdAt.toISOString(),
        senderId: lastMessage.senderId.toString(),
        receiverId: lastMessage.receiverId?.toString(),
        isRead: lastMessage.isRead
      } : null
    };
    
    return NextResponse.json({ conversation: formattedConversation });
  } catch (error) {
    console.error('获取对话失败:', error);
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 });
  }
} 