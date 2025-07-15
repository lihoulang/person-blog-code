'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ConversationList from './ConversationList';
import ChatBox from './ChatBox';
import { Conversation } from '@/types/chat';
import { toast } from 'react-toastify';

interface MessagingProps {
  userId: string;
}

export default function Messaging({ userId }: MessagingProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');
  
  // 如果URL中有conversationId，则加载对应的对话
  useEffect(() => {
    if (conversationId) {
      loadConversationById(conversationId);
    }
  }, [conversationId]);
  
  // 通过ID加载对话
  const loadConversationById = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('获取对话失败');
      }
      
      const data = await response.json();
      setSelectedConversation(data.conversation);
    } catch (error) {
      console.error('加载对话失败:', error);
      toast.error('加载对话失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理选择对话
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // 更新URL，但不刷新页面
    const url = new URL(window.location.href);
    url.searchParams.set('conversation', conversation.id);
    window.history.pushState({}, '', url);
  };
  
  // 处理发送消息后的刷新
  const handleMessageSent = () => {
    // 这里可以添加刷新对话列表的逻辑
  };
  
  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 左侧对话列表 */}
      <div className="w-1/3 border-r">
        <ConversationList
          userId={userId}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>
      
      {/* 右侧聊天区域 */}
      <div className="w-2/3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedConversation ? (
          <ChatBox
            conversation={selectedConversation}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>选择一个对话开始聊天</p>
          </div>
        )}
      </div>
    </div>
  );
} 