import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SendMessageRequest } from '@/types/chat';
import { sendPrivateMessage } from '@/lib/socket';

// 获取特定对话的消息
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
    
    // 检查用户是否有权限访问此对话
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
    });
    
    if (!conversation || !conversation.participantIds.includes(userId.toString())) {
      return NextResponse.json({ error: '无权访问此对话' }, { status: 403 });
    }
    
    // 获取对话消息
    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    // 将未读消息标记为已读（当前用户是接收者的消息）
    await prisma.message.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        receiverId: parseInt(userId.toString()),
        isRead: false
      },
      data: { isRead: true }
    });
    
    // 格式化消息数据
    const formattedMessages = messages.map(message => ({
      id: message.id.toString(),
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId?.toString(),
      conversationId: message.conversationId.toString(),
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      isRead: message.isRead
    }));
    
    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('获取消息失败:', error);
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 });
  }
}

// 发送消息
export async function POST(
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
    
    // 检查用户是否有权限访问此对话
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
    });
    
    if (!conversation || !conversation.participantIds.includes(userId.toString())) {
      return NextResponse.json({ error: '无权访问此对话' }, { status: 403 });
    }
    
    // 解析请求体
    const body = await request.json() as SendMessageRequest;
    const { content, receiverId } = body;
    
    if (!content || !receiverId) {
      return NextResponse.json({ error: '消息内容和接收者不能为空' }, { status: 400 });
    }
    
    // 创建新消息
    const message = await prisma.message.create({
      data: {
        content,
        senderId: parseInt(userId.toString()),
        receiverId: parseInt(receiverId),
        conversationId: parseInt(conversationId),
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    // 更新对话的最后消息时间
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { lastMessageAt: new Date() }
    });
    
    // 格式化消息数据
    const formattedMessage = {
      id: message.id.toString(),
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId?.toString(),
      conversationId: message.conversationId.toString(),
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar,
      isRead: message.isRead
    };
    
    // 通过Socket.IO发送实时通知
    try {
      // 给接收者发送新消息通知
      sendPrivateMessage(receiverId, 'new_message', formattedMessage);
    } catch (socketError) {
      console.error('发送Socket通知失败:', socketError);
      // 即使Socket通知失败，我们仍然继续处理请求
    }
    
    return NextResponse.json({ message: formattedMessage });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
} 