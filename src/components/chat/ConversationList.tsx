'use client';

import React, { useState, useEffect } from 'react';
import { Conversation } from '@/types/chat';
import ConversationItem from './ConversationItem';
import { toast } from 'react-toastify';

interface ConversationListProps {
  userId: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationList({
  userId,
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载对话列表
  useEffect(() => {
    fetchConversations();
  }, []);

  // 获取对话列表
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversations', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('获取对话列表失败');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('获取对话列表错误:', error);
      toast.error('加载对话列表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">消息</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          {conversations.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <p>暂无对话</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedConversationId === conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 