import { prisma } from './prisma';
import { Conversation, ConversationWithLastMessage, ConversationWithUsers, Message } from '@/types/message';
import { User } from '@/types/user';

// 格式化对话数据
function formatConversation(conversation: any): ConversationWithUsers {
  return {
    id: String(conversation.id),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    name: conversation.name || null,
    isGroup: conversation.isGroup,
    messages: (conversation.messages || []).map(formatMessage),
    users: (conversation.users || []).map(formatUserConversation),
    otherUsers: (conversation.users || [])
      .filter((uc: any) => uc.user?.id !== conversation.currentUserId)
      .map((uc: any) => formatUser(uc.user)),
    lastMessage: conversation.messages?.[0] 
      ? formatMessage(conversation.messages[0]) 
      : undefined
  };
}

// 格式化消息数据
function formatMessage(message: any): Message {
  return {
    id: String(message.id),
    content: message.content,
    image: message.image || null,
    createdAt: message.createdAt.toISOString(),
    senderId: String(message.senderId),
    receiverId: message.receiverId ? String(message.receiverId) : undefined,
    conversationId: String(message.conversationId),
    isRead: message.isRead,
    sender: message.sender ? formatUser(message.sender) : undefined,
    receiver: message.receiver ? formatUser(message.receiver) : undefined
  };
}

// 格式化用户数据
function formatUser(user: any): User {
  if (!user) return null;
  
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    role: user.role,
    bio: user.bio || null,
    avatar: user.avatar || null,
    online: user.online || false,
    lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null
  };
}

// 格式化用户对话关系
function formatUserConversation(userConversation: any) {
  return {
    id: String(userConversation.id),
    userId: String(userConversation.userId),
    conversationId: String(userConversation.conversationId),
    createdAt: userConversation.createdAt.toISOString(),
    lastRead: userConversation.lastRead.toISOString(),
    user: formatUser(userConversation.user)
  };
}

// 获取用户的所有对话
export async function getUserConversations(userId: number): Promise<ConversationWithLastMessage[]> {
  try {
    // 查询用户参与的所有对话
    const userConversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: true,
            receiver: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // 计算未读消息数量
    const conversationsWithUnreadCount = await Promise.all(
      userConversations.map(async (conversation) => {
        // 获取用户在此对话中最后阅读时间
        const userConversation = await prisma.userConversation.findUnique({
          where: {
            userId_conversationId: {
              userId,
              conversationId: conversation.id
            }
          }
        });

        const lastRead = userConversation?.lastRead;

        // 统计未读消息数量
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead }
          }
        });

        return {
          ...conversation,
          unreadCount,
          currentUserId: userId
        };
      })
    );

    // 格式化并返回对话列表
    return conversationsWithUnreadCount.map(formatConversation);
  } catch (error) {
    console.error('获取用户对话列表失败:', error);
    return [];
  }
}

// 获取或创建两个用户之间的私聊对话
export async function getOrCreateConversation(
  currentUserId: number,
  otherUserId: number
): Promise<ConversationWithUsers | null> {
  try {
    // 检查用户是否存在
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId }
    });

    if (!otherUser) {
      throw new Error('对方用户不存在');
    }

    // 查找两人之间现有的私聊对话
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            users: {
              some: {
                userId: currentUserId
              }
            }
          },
          {
            users: {
              some: {
                userId: otherUserId
              }
            }
          }
        ]
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            sender: true,
            receiver: true
          }
        }
      }
    });

    if (existingConversation) {
      return formatConversation({ ...existingConversation, currentUserId });
    }

    // 如果不存在，创建新的对话
    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        users: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });

    return formatConversation({ ...newConversation, messages: [], currentUserId });
  } catch (error) {
    console.error('获取或创建对话失败:', error);
    return null;
  }
}

// 获取对话详情
export async function getConversationById(
  conversationId: number,
  userId: number
): Promise<ConversationWithUsers | null> {
  try {
    // 查询对话详情，并检查当前用户是否有权限访问
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        users: {
          some: {
            userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            sender: true,
            receiver: true
          }
        }
      }
    });

    if (!conversation) {
      return null;
    }

    // 更新用户的最后阅读时间
    await prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId
        }
      },
      data: {
        lastRead: new Date()
      }
    });

    // 标记所有收到的消息为已读
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return formatConversation({ ...conversation, currentUserId: userId });
  } catch (error) {
    console.error('获取对话详情失败:', error);
    return null;
  }
}

// 发送消息
export async function sendMessage(
  conversationId: number,
  senderId: number,
  receiverId: number | null,
  content: string,
  image?: string
): Promise<Message | null> {
  try {
    // 检查发送者是否在对话中
    const userInConversation = await prisma.userConversation.findUnique({
      where: {
        userId_conversationId: {
          userId: senderId,
          conversationId
        }
      }
    });

    if (!userInConversation) {
      throw new Error('您不是此对话的成员');
    }

    // 创建新消息
    const message = await prisma.message.create({
      data: {
        content,
        image,
        senderId,
        receiverId,
        conversationId,
        isRead: false
      },
      include: {
        sender: true,
        receiver: true
      }
    });

    // 更新对话的最后消息时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // 更新发送者的最后阅读时间
    await prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId: senderId,
          conversationId
        }
      },
      data: {
        lastRead: new Date()
      }
    });

    return formatMessage(message);
  } catch (error) {
    console.error('发送消息失败:', error);
    return null;
  }
}

// 获取用户的所有在线联系人
export async function getOnlineContacts(userId: number): Promise<User[]> {
  try {
    // 获取所有用户关注的人
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { 
        following: true 
      }
    });
    
    // 过滤出在线的联系人
    const onlineContacts = following
      .filter(follow => follow.following.online)
      .map(follow => formatUser(follow.following));
    
    return onlineContacts;
  } catch (error) {
    console.error('获取在线联系人失败:', error);
    return [];
  }
}

// 更新用户在线状态
export async function updateUserOnlineStatus(userId: number, isOnline: boolean): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        online: isOnline,
        lastSeen: isOnline ? undefined : new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('更新用户在线状态失败:', error);
    return false;
  }
} 