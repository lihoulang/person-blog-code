// 消息类型
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
}

// 对话类型
export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number; // 未读消息计数
  otherUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// 创建对话的请求类型
export interface CreateConversationRequest {
  userId: string;
}

// 发送消息的请求类型
export interface SendMessageRequest {
  content: string;
  receiverId: string;
  conversationId?: string;
} 