import { User } from './user';

export interface Message {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  senderId: string;
  receiverId?: string;
  conversationId: string;
  isRead: boolean;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  name?: string;
  isGroup: boolean;
  messages: Message[];
  users: UserConversation[];
  lastMessage?: Message;
}

export interface UserConversation {
  id: string;
  userId: string;
  conversationId: string;
  createdAt: string;
  lastRead: string;
  user: User;
}

export interface ConversationWithUsers extends Conversation {
  otherUsers: User[];
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message;
  otherUsers: User[];
  unreadCount?: number;
} 